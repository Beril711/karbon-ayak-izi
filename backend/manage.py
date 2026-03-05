#!/usr/bin/env python
"""Django'nun komut satırı yönetim aracı."""
import os
import sys


def main():
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Django kurulamadı veya sanal ortam aktif değil. "
            "'pip install -r requirements.txt' komutunu çalıştır."
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
