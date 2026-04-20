#!/usr/bin/env python3
"""
GreenGate - Single startup script
Starts backend (port 3001) and frontend (port 5173) concurrently.

Usage:  python start.py
Quit:   Ctrl+C
"""

import os
import sys
import time
import shutil
import threading
import subprocess
import webbrowser

ROOT         = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR  = os.path.join(ROOT, 'backend')
FRONTEND_DIR = os.path.join(ROOT, 'frontend')
FRONTEND_URL = 'http://localhost:5173'
BACKEND_URL  = 'http://localhost:3001'

G = '\033[92m'   # green
C = '\033[96m'   # cyan
Y = '\033[93m'   # yellow
R = '\033[91m'   # red
B = '\033[1m'    # bold
X = '\033[0m'    # reset

_procs: list[subprocess.Popen] = []


# ── helpers ──────────────────────────────────────────────────────────────────

def check_node():
    if not shutil.which('node') or not shutil.which('npm'):
        print(f"{R}[error] Node.js / npm not found.{X}")
        print(f"        Install from https://nodejs.org/ and re-run this script.")
        sys.exit(1)


def install_deps(cwd: str, name: str):
    if not os.path.isdir(os.path.join(cwd, 'node_modules')):
        print(f"{Y}[install] Installing {name} dependencies…{X}")
        r = subprocess.run('npm install', cwd=cwd, shell=True)
        if r.returncode != 0:
            print(f"{R}[error] npm install failed in {cwd}{X}")
            sys.exit(1)
        print(f"{G}[install] {name} — done.{X}")


def stream(proc: subprocess.Popen, prefix: str, color: str):
    try:
        for line in iter(proc.stdout.readline, ''):
            if line.strip():
                sys.stdout.write(f"{color}[{prefix}]{X} {line}")
                sys.stdout.flush()
    except Exception:
        pass


def spawn(cwd: str, cmd: str, name: str, color: str) -> subprocess.Popen:
    proc = subprocess.Popen(
        cmd,
        cwd=cwd,
        shell=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        encoding='utf-8',
        errors='replace',
        bufsize=1,
    )
    _procs.append(proc)
    threading.Thread(target=stream, args=(proc, name, color), daemon=True).start()
    return proc


def watch():
    while True:
        time.sleep(1)
        for p in _procs:
            if p.poll() is not None:
                print(f"\n{R}[error] A server exited unexpectedly.{X}")
                shutdown(1)


def open_browser():
    time.sleep(4)
    print(f"\n{B}{G}  GreenGate is live!{X}")
    print(f"  Frontend  {FRONTEND_URL}")
    print(f"  Backend   {BACKEND_URL}")
    print(f"  Press {B}Ctrl+C{X} to stop.\n")
    webbrowser.open(FRONTEND_URL)


def shutdown(code: int = 0):
    print(f"\n{Y}[stop] Shutting down GreenGate…{X}")
    for p in _procs:
        try:
            p.terminate()
        except Exception:
            pass
    time.sleep(1)
    for p in _procs:
        try:
            p.kill()
        except Exception:
            pass
    sys.exit(code)


# ── main ─────────────────────────────────────────────────────────────────────

def main():
    os.system('')   # enable ANSI codes on Windows terminal

    print(f"\n{B}{G}  GreenGate — Autonomous Procurement Guardian{X}")
    print(f"{G}  Earth Day Weekend Challenge{X}\n")

    check_node()
    install_deps(BACKEND_DIR,  'backend')
    install_deps(FRONTEND_DIR, 'frontend')

    print(f"\n{G}[start] Backend  → port 3001{X}")
    spawn(BACKEND_DIR,  'npm start',    'backend',  G)

    print(f"{C}[start] Frontend → port 5173{X}")
    spawn(FRONTEND_DIR, 'npm run dev',  'frontend', C)

    threading.Thread(target=open_browser, daemon=True).start()
    threading.Thread(target=watch,        daemon=True).start()

    try:
        while True:
            time.sleep(0.5)
    except KeyboardInterrupt:
        shutdown(0)


if __name__ == '__main__':
    main()
