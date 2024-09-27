-- <name> <arg1> <arg2> ... <argN> = <expression> for function

-- <> operator can concatenate two string
-- wrapHtml content = "<html><body>" <> content <> "</body></html>"



__html_ :: String -> String
__html_ content = "<html>" <> content <> "</html>"

__head_ :: String -> String
__head_ content = "<head>" <> content <> "</head>"

__title_ :: String -> String
__title_ content = "<title>" <> content <> "</title>"

__body_ :: String -> String
__body_ content = "<body>" <> content <> "</body>"

__wrapHtml :: String -> String
__wrapHtml content = __html_ (__body_ content)

__makeHtml :: String -> String -> String
__makeHtml title content = __html_ ((__head_ (__title_ title)) <> (__body_ content))


-- 3.1 에 타입을 적용한 모습 

el:: String -> String -> String
el = \tag -> \content ->
   "<" <> tag <> ">" <> content <> "</" <> tag  <> ">" 
  
-- el tag content = 
--   "<" <> tags <> ">" <> content <> "</" tags ">" 



-- content 를 인자로 받는 함수가 되어버리는거임!
html_ :: String -> String
html_ = el "html"

body_ :: String -> String
body_ = el "body"

title_ :: String -> String
title_ = el "title"

head_ :: String -> String
head_ = el "head"

-- wrapHtml_ :: String -> String
-- wrapHtml_ = \content ->
--   (html_ (body_ content )  


makeHtml_ :: String -> String -> String
makeHtml_ = \title -> \content ->
  html_ (( head_ (title_ title)) <> body_ content)
  

main = putStrLn (makeHtml_ "Hello Title" "Body")








