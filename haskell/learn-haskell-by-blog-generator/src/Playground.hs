{-# OPTIONS_GHC -Wno-unrecognised-pragmas #-}

{-# HLINT ignore "Redundant if" #-}
module Playground
  ( hello,
    contrivedAdd,
    rep,
    Playground.even,
    Playground.odd,
  )
where

hello :: String -> String
hello str = "Hello " <> str

increment :: Int -> Int
increment a = a + 1

decrement :: Int -> Int
decrement a = a - 1

contrivedAdd :: Int -> Int -> Int
contrivedAdd a b =
  if b /= 0
    then contrivedAdd (increment a) (decrement b)
    else a

-- 1. base case: 길이가 0보다 작으면 일단 빈 리스트를 생성한다
-- 2. Reduce: 사이즈가 N 인 리스트를 어떻게 생성할지 모르지만, 만약 N-1 의 해결책을 안다면 다음을 생각해 볼 수 있다
-- 3. Mitigate: N-1 의 해결책에 `:` operator 를 사용해서 element 를 하나 추가한다.

rep :: Int -> a -> [a]
rep n value =
  if n <= 0
    then [] -- 1
    else value : rep (n - 1) value --  mitigation : reduction

even :: Int -> Bool
even n =
  if n == 0
    then
      True
    else
      Playground.odd (n - 1)

odd :: Int -> Bool
odd n =
  if n == 0
    then
      False
    else
      Playground.even (n - 1)
