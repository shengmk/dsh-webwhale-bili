#!/usr/bin/env python3
"""faster-whisper 转录桥：每行输出一个 JSON segment，供 Node 读取。

音频先用 ffmpeg 解成 16k 单声道 float32，再交给 faster-whisper，
避免 PyAV 版本与 faster-whisper 的 metadata_errors 参数不兼容。
"""
import json
import os
import subprocess
import sys

import numpy as np

# Hugging Face 在部分网络不可达；默认走镜像，可用 WW_WHISPER_ENDPOINT 覆盖。
os.environ.setdefault("HF_ENDPOINT", os.environ.get("WW_WHISPER_ENDPOINT", "https://hf-mirror.com"))

from faster_whisper import WhisperModel  # noqa: E402


def decode_with_ffmpeg(path):
    command = [
        "ffmpeg", "-nostdin", "-hide_banner", "-loglevel", "error",
        "-i", path, "-f", "s16le", "-acodec", "pcm_s16le",
        "-ac", "1", "-ar", "16000", "-",
    ]
    result = subprocess.run(command, capture_output=True, check=False)
    if result.returncode != 0:
        raise RuntimeError("ffmpeg 解码失败：" + result.stderr.decode("utf-8", "replace")[-400:])
    if not result.stdout:
        raise RuntimeError("ffmpeg 没有输出音频")
    samples = np.frombuffer(result.stdout, dtype=np.int16).astype(np.float32) / 32768.0
    return samples


def main():
    if len(sys.argv) < 2:
        print("usage: transcribe-audio.py <audio-file>", file=sys.stderr)
        return 2
    path = sys.argv[1]
    model_name = os.environ.get("WW_WHISPER_MODEL", "small")
    model = WhisperModel(model_name, device="cpu", compute_type="int8", cpu_threads=max(2, min(8, os.cpu_count() or 4)))
    audio = decode_with_ffmpeg(path)
    # 长视频用贪心解码，速度约为 beam_size=5 的数倍；中文内容仍足够做摘要。
    segments, info = model.transcribe(audio, language="zh", vad_filter=True, beam_size=1, condition_on_previous_text=False)
    print(json.dumps({"language": getattr(info, "language", "zh"), "duration": len(audio) / 16000}, ensure_ascii=False))
    for segment in segments:
        text = str(getattr(segment, "text", "")).strip()
        if not text:
            continue
        print(json.dumps({
            "start": float(getattr(segment, "start", 0) or 0),
            "end": float(getattr(segment, "end", 0) or 0),
            "text": text,
        }, ensure_ascii=False), flush=True)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
