#!/usr/bin/env python3
import datetime

def generate_session_id():
    """
    YYYYMMDD-HHMMSS 形式のセッション ID を生成します。
    """
    return datetime.datetime.now().strftime("%Y%m%d-%H%M%S")

if __name__ == "__main__":
    print(generate_session_id())
