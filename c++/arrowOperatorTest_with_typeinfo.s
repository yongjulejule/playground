	.section	__TEXT,__text,regular,pure_instructions
	.build_version macos, 13, 0	sdk_version 13, 0
	.globl	_main                           ; -- Begin function main
	.p2align	2
_main:                                  ; @main
	.cfi_startproc
; %bb.0:
	sub	sp, sp, #32
	stp	x29, x30, [sp, #16]             ; 16-byte Folded Spill
	add	x29, sp, #16
	.cfi_def_cfa w29, 16
	.cfi_offset w30, -8
	.cfi_offset w29, -16
	adrp	x0, __ZTI1A@PAGE
	add	x0, x0, __ZTI1A@PAGEOFF
	bl	__ZNKSt9type_info4nameEv
	mov	x8, sp
	str	x0, [x8]
	adrp	x0, l_.str@PAGE
	add	x0, x0, l_.str@PAGEOFF
	bl	_printf
	mov	w0, #0
	ldp	x29, x30, [sp, #16]             ; 16-byte Folded Reload
	add	sp, sp, #32
	ret
	.cfi_endproc
                                        ; -- End function
	.p2align	2                               ; -- Begin function _ZNKSt9type_info4nameEv
__ZNKSt9type_info4nameEv:               ; @_ZNKSt9type_info4nameEv
	.cfi_startproc
; %bb.0:
	sub	sp, sp, #16
	.cfi_def_cfa_offset 16
	str	x0, [sp]
	ldr	x8, [sp]
	ldr	x8, [x8, #8]
	str	x8, [sp, #8]
	ldr	x8, [sp, #8]
	and	x0, x8, #0x7fffffffffffffff
	add	sp, sp, #16
	ret
	.cfi_endproc
                                        ; -- End function
	.section	__TEXT,__cstring,cstring_literals
l_.str:                                 ; @.str
	.asciz	"%s\n"

	.private_extern	__ZTS1A                 ; @_ZTS1A
	.section	__TEXT,__const
	.globl	__ZTS1A
	.weak_definition	__ZTS1A
__ZTS1A:
	.asciz	"1A"

	.private_extern	__ZTI1A                 ; @_ZTI1A
	.section	__DATA,__const
	.globl	__ZTI1A
	.weak_definition	__ZTI1A
	.p2align	3
__ZTI1A:
	.quad	__ZTVN10__cxxabiv117__class_type_infoE+16
	.quad	__ZTS1A-9223372036854775808

.subsections_via_symbols
