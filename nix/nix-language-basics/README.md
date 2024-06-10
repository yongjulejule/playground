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

### inherit ...;

`inherit` 을 사용하면 attribute set 의 attribute 를 현재 scope 로 가져올 수 있음

```nix
let
    x = 1;
    y = 2;
in
{
    inherit x y;
}

let
  a = {
    x = 1;
    y = 2;
    z = 3;
  };
in
{
  inherit (a) x y;
  z = 4;
}
# { x = 1; y = 2; z = 4; }
```

`let` 에서도 사용 가능

```nix
let
  inherit ({ x = 1; y = 2; }) x y;
in [ x y ]
```

## String interpolation ${ ... }

javascript 처럼 사용 가능

```nix
let
  name = "nix";
in
"Hello, ${name}!"

# "Hello, nix!"
```

물론 integer 같은 다른 타입은 어림도 없음

```nix
let
  name = 42;
in
"Hello, ${name}!"

# Error!
```

## File System Paths

`/` 로 시작하는 문자열은 파일 시스템 절대 경로로 인식됨

`/` 로 시작하지 않으며 `/` 를 포함하는 문자열은 상대 경로로 인식됨 (현재 디렉토리 기준)

## Lookup Paths

`<nixpkgs>` 와 같이 `<...>` 로 둘러싸인 문자열은 lookup path 로 인식됨

lookup path 의 결과는 `builtins.nixPath` 에서 정의된 경로들을 차례로 탐색함

## Indented Strings

`''` 로 둘러싸인 문자열은 여러 줄로 이루어진 문자열을 표현할 수 있음

```nix
''
multi
 line
  string
''

# "multi\n line\n  string\n"

```

# Functions

function 은 항상 하나의 인자를 받으며 인자와 함수 본문은 `:` 로 구분됨

nix 에서 `:` 가 나오면 좌항은 인자, 우항은 함수 본문으로 인식함

```nix
#Single argument
x: x + 1

#Multiple arguments via nesting
x: y: x + y

#Attribute set argument
{ a, b }: a + b

#With default attributes
{ a, b ? 0 }: a + b

#With additional attributes allowed
{ a, b, ...}: a + b

#Named attribute set argument
args@{ a, b, ... }: a + b + args.c
#or
{ a, b, ... }@args: a + b + args.c
```

함수의 이름은 없음. 익명함수이며 lambda 라 부름

```nix
let
  f = x: x + 1;
in f

# <lambda>
```

## Calling Functions

"Calling a function witn an argument" 는 함수 이후에 인자 입력을 뜻함

```nix
let
  f = x: x + 1;
in
  f 1

# 2

let
  f = x: x.a;
  v = { a = 1; };
in
f v

# 1
```

혹은, 괄호를 이용해서 즉시 호출할 수 있음

```nix
(x: x + 1) 1

# 2
```

list 도 white space 로 구분되기 때문에 괄호를 사용해야함

```nix
let
  f = x: x + 1;
  a = 3;
in [ (f a) f a]

# [ 4 <lambda> 3]
```

## Multiple Arguments

"curried functions" 으로도 알려져 있음

```nix
x: y: x + y

# <lambda>

# Equivalent to
x: (y: x + y)
```

```nix
let
  f = x: y: x + y;
in
f 1 2

# 3
```

## Attribute Set Arguments

"Keyword arguments" 혹은 "destructuring" 로도 알려져 있음

```nix
{ a, b }: a + b

# <lambda>

let
  f = {a, b}: a + b;
in
f { a = 1; b = 2; }

# 3
```

Attribute set 과 정확히 일치하지 않으면 에러가 발생함

## Default Arguments

```nix
let
 { a, b ? 0 }: a + b;
in f { a = 1; }
```

## Additional Arguments

... 을 사용하면 추가적인 attribute 를 받을 수 있음

```nix
let
  f = { a, b, ... }: a + b;
in
f { a = 1; b = 2; c = 3; }

# 3
```

이럴거면 왜 인자 하나만 받게... 한거지?

## Named attribute set arguments

"@ pattern", "@ syntax", or "at syntax" 으로도 알려져 있음

```nix
args@{ a, b, ... }: a + b + args.c
# or
{ a, b, ... }@args: a + b + args.c
```
