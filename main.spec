# -*- mode: python ; coding: utf-8 -*-


a = Analysis(
    ['main.py'],
    pathex=[],
    binaries=[],
    datas=[('C:\\Users\\bmaty\\Desktop\\DMP\\venv\\Lib\\site-packages\\eel\\eel.js', 'eel'), ('.\\frontend\\dist\\browser', '.\\frontend\\dist\\browser'), ('.\\backend\\database\\database.db', '.\\backend\\database')],
    hiddenimports=['bottle_websocket', 'eel', 'bottle', 'gevent', 'gevent.socket', 'gevent._socket3'],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    noarchive=False,
    optimize=0,
)
pyz = PYZ(a.pure)

exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,
    name='program',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    console=False,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon='program_icon.png',
)
coll = COLLECT(
    exe,
    a.binaries,
    a.datas,
    strip=False,
    upx=True,
    upx_exclude=[],
    name='revision_planner',
)
