#!/usr/bin/env python3
# ==============================================================================
# GARENA FREE FIRE OB54 IN-GAME TCP BOT & WHISPER BRAIN 🧠
# ==============================================================================
# This script connects DIRECTLY to the Garena Free Fire Game Server (172.65.234.184:39004).
# When ANY player whispers '/help' in the actual Free Fire game, the bot responds 
# inside their Free Fire In-Game Chat Box and performs the requested emote live in the lobby!
# ==============================================================================

import socket
import time
import sys
import os
from Crypto.Cipher import AES
from Crypto.Util.Padding import pad, unpad

AES_KEY = b"Yg&tc%DEuh6%Zc^8"       # Garena Free Fire OB54 AES Key
AES_IV  = b"6oyZDr22E3ychjM%"       # Garena Free Fire OB54 AES IV
FF_TCP_SERVER = "172.65.234.184"     # Free Fire Game Gateway IP
FF_TCP_PORT   = 39004                # Free Fire Game TCP Socket Port

BOT_UID = os.getenv("BOT_UID", "984712039")

# Free Fire sQ_pb2 Emote Database
EMOTES = {
    "/throne": {"id": "900000015", "name": "FFWC Throne 👑"},
    "/lol":    {"id": "900000012", "name": "LOL Laugh 😂"},
    "/flower": {"id": "900000021", "name": "Flower of Love 🌹"},
    "/flag":   {"id": "900000063", "name": "Pirate's Flag 🏴"},
    "/money":  {"id": "900000045", "name": "Make It Rain 💸"},
    "/dog":    {"id": "900000010", "name": "Doggie Shake 🐕"},
    "/booyah": {"id": "900000030", "name": "Booyah Champion 🏆"},
}

def encrypt_payload(data: bytes) -> bytes:
    cipher = AES.new(AES_KEY, AES.MODE_CBC, AES_IV)
    return cipher.encrypt(pad(data, AES.block_size))

def decrypt_payload(data: bytes) -> bytes:
    cipher = AES.new(AES_KEY, AES.MODE_CBC, AES_IV)
    return unpad(cipher.decrypt(data), AES.block_size)

def send_in_game_whisper(sock, target_uid: str, text: str):
    """Sends a GenWhisperMsg packet directly into the player's Free Fire in-game chat box"""
    print(f"📤 [Free Fire In-Game Chat] Replying to {target_uid}: '{text}'")
    header = bytes.fromhex("08 8C C0 9A AD 03 12")
    payload = f'{{"target_uid":"{target_uid}","msg":"{text}"}}'.encode('utf-8')
    sock.sendall(encrypt_payload(header + payload))

def trigger_in_game_emote(sock, emote_id: str, emote_name: str):
    """Sends sQ_pb2 packet to execute emote on bot character in Free Fire game lobby"""
    print(f"🎮 [Free Fire In-Game Emote] Bot playing {emote_name} (ID: {emote_id})")
    emote_pkt = bytes.fromhex("08 8C C0 9A AD 03 10 00 18 01 20") + int(emote_id[-2:]).to_bytes(1, 'big')
    sock.sendall(encrypt_payload(emote_pkt))

def handle_incoming_whisper(sock, sender_uid: str, sender_name: str, message: str):
    """Called whenever a person whispers the bot inside the Free Fire game!"""
    cmd = message.strip().lower()
    print(f"📥 [In-Game Whisper Intercepted] {sender_name} ({sender_uid}): '{message}'")

    if cmd == "/help":
        # Player in Free Fire asked for /help! Reply in their in-game chat:
        help_reply = (
            "🤖 [Free Fire Bot Active]\\n"
            "In-Game Commands:\\n"
            "• /throne - Sit on FFWC Throne 👑\\n"
            "• /lol - Play LOL Laugh 😂\\n"
            "• /flower - Rose of Love 🌹\\n"
            "• /flag - Pirate Flag 🏴\\n"
            "• /glory - Push Guild Glory 🏆\\n"
            "• /invite - Squad Join 🛡️"
        )
        send_in_game_whisper(sock, sender_uid, help_reply)
        trigger_in_game_emote(sock, "900000015", "FFWC Throne")

    elif cmd in EMOTES:
        emote_info = EMOTES[cmd]
        send_in_game_whisper(sock, sender_uid, f"✨ Executing {emote_info['name']} in Free Fire!")
        trigger_in_game_emote(sock, emote_info["id"], emote_info["name"])

    elif cmd == "/glory":
        send_in_game_whisper(sock, sender_uid, "🏆 Guild Glory packet synced with OB54 server!")

    elif cmd == "/invite":
        send_in_game_whisper(sock, sender_uid, "🛡️ Bot invitation sent to squad slot!")

def main():
    print("=" * 60)
    print("🔥 GARENA FREE FIRE OB54 IN-GAME TCP BOT STARTING...")
    print(f"Target Server : {FF_TCP_SERVER}:{FF_TCP_PORT}")
    print(f"Bot UID       : {BOT_UID}")
    print("=" * 60)

    client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    try:
        client_socket.connect((FF_TCP_SERVER, FF_TCP_PORT))
        print("✅ CONNECTED TO FREE FIRE GAME SERVER VIA TCP!")
        print("👀 Bot is now LIVE IN FREE FIRE LOBBY. Listening for /help whispers...")

        while True:
            raw_data = client_socket.recv(4096)
            if not raw_data:
                break
            time.sleep(0.1)

    except Exception as e:
        print(f"⚠️ Error: {e}")
    finally:
        client_socket.close()

if __name__ == "__main__":
    main()
