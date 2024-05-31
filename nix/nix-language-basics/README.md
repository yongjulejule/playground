https://nix.dev/tutorials/nix-language#reading-nix-language

# 실행하는법

```bash
nix repl
> 1 + 2
3

```

```bash
echo 1 + 2 > file.nix
nix-instantiate --eval file.nix
```

# Names and Values

nix 에서 value 는 primitive data types, lists, attribute sets, functions 가 있음

## Attribute Set `{...}`

Collection of Name-value Pairs. Names must be unique.

```nix
{
  string = "hello";
  integer = 1;
  float = 3.141;
  bool = true;
  null = null;
  list = [ 1 "two" false ];
  attribute-set = {
    a = "hello";
    b = 2;
    c = 2.718;
    d = false;
  }; # comments are supported
}
```

### Recursive Attribute Set `rec {...}`

```nix
rec {
  a = 1;
  b = a + 1;
  c = b + 1;
}
```

```bash
# 이거도 됨. 순서 노상관
nix-repl> rec { a = 1; b = a + 1; c = a + b + 1 + d; d = a;}
{
  a = 1;
  b = 2;
  c = 5;
  d = 1;
}

# 이거는 안됨. 순환참조
nix-repl> rec { a=1; b=a + 1; c= a + b + 1 +d; d = c;}
{
  a = 1;
  b = 2;
  c = «error: infinite recursion encountered»;
  d = «error: infinite recursion encountered»;
}
```

## "`let` Expressions" or "`let` binding"

```nix
let
  a = 1;
  b = a + 1;
  c = b + 1;
in
  a + b + c

# 6

list = let b = a + 1; c = a + b; a = 42; in [a b c]

:p list
# [
#   42
#   43
#   85
# ]

let
  attrset = { a = { b = { c = 1; }; }; };
in
attrset.a.b.c

# 1

```

### with ...; ...

`with` 를 사용하면 attribute set 의 attribute 들을 참조 할때 attribute 이름을 생략할 수 있음

```nix
let
  a = {
    x = 1;
    y = 2;
    z = 3;
  };
in
with a; [ x y z ]

# [ 1 2 3 ]
```
