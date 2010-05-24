#!/usr/bin/python

from distutils.core import setup, Extension

libemu = Extension('libemu',
                    sources = ['libemu_module.c'],
                    include_dirs = ['@includedir@', '/opt/libemu/include'],
                    library_dirs = ['@libdir@', '/opt/libemu/lib', '/opt/libemu/lib/libemu/'],
                    libraries = ['emu'],
                    )

setup (name = 'libemu',
       version = '@VERSION@',
       description = 'Python interface to the libemu x86 emulator.',
       author = 'Z. Chen, Georg Wicherski',
       author_email = 'czj.pub@gmail.com, gw@mwcollect.org',
       url = 'http://code.google.com/p/phoneyc/, http://libemu.mwcollect.org/',
       ext_modules = [libemu])
