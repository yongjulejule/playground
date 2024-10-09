
main :: IO ()
main = do
  putStrLn (render (makeHtml_ "Hello title" "Hello body"))


-- Types
newtype Html = Html String
newtype Structure = Structure String


-- tags
-- html, head, title, body 

p_ :: String -> Structure 
p_ = Structure . el "p"

html_ :: String -> Html
html_ = Html . el "html"

head_ :: String -> Structure
head_ = Structure . el "head"

title_ :: String -> Structure
title_ = Structure . el "title"

body_ :: String -> Structure
body_ = Structure . el "body"

-- utility

el :: String -> String -> String
el = \tag -> \content ->
   "<" <> tag <> ">" <> content <> "</" <> tag  <> ">" 

makeHtml_ :: String -> String -> Html
makeHtml_ = \title -> \content ->
  html_ (getStructureString (append_ (title_ title) (body_ content)))

append_ :: Structure -> Structure -> Structure
-- append_ target content = Structure ((getStructureString target ) <> (getStructureString content))
append_ (Structure a) (Structure b) 
  = Structure ( a <> b )

render :: Html -> String
-- render (Html a) = a
render html =
  case html of
    Html str -> str

getStructureString :: Structure -> String 
getStructureString struct = 
  case struct of
    Structure str -> str

