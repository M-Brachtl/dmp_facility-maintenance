import sys
import pathlib
import shutil

base = pathlib.Path(__file__).resolve().parent
src = base / "database.db"
backup_dir = base / "backup"

def backup_database():
    num_files = 0
    duplicity_check = ""
    if backup_dir.exists() and backup_dir.is_dir():
        num_files = sum(1 for p in backup_dir.iterdir() if p.is_file())
    print(f"Backup files: {num_files}")

    # check for already existing backup with same name
    while (backup_dir / f"database_{num_files}.db").exists():
        duplicity_check += "_dup"

    dest = backup_dir / f"database_{num_files}{duplicity_check}.db" # no +1 because of .gitkeep
    if not src.exists():
        print(f"Source not found: {src}", file=sys.stderr)
        sys.exit(1)

    backup_dir.mkdir(parents=True, exist_ok=True)

    try:
        shutil.copy2(src, dest)
        print(f"Copied {src} -> {dest}")
    except Exception as e:
        print(f"Failed to copy: {e}", file=sys.stderr)
        sys.exit(1)

def restore_database(file_number: int):
    backup_file = backup_dir / f"database_{file_number}.db"
    if not backup_file.exists():
        print(f"Backup file not found: {backup_file}", file=sys.stderr)
        sys.exit(1)

    try:
        shutil.copy2(backup_file, src)
        print(f"Restored {backup_file} -> {src}")
    except Exception as e:
        print(f"Failed to restore: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    restore_database(2)