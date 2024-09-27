-- <name> <arg1> <arg2> ... <argN> = <expression> for function

-- <> operator can concatenate two string
-- wrapHtml content = "<html><body>" <> content <> "</body></html>"


html_ :: String -> String
html_ content = "<html>" <> content <> "</html>"

head_ :: String -> String
head_ content = "<head>" <> content <> "</head>"

title_ :: String -> String
title_ content = "<title>" <> content <> "</title>"

body_ :: String -> String
body_ content = "<body>" <> content <> "</body>"

wrapHtml :: String -> String
wrapHtml content = html_ (body_ content)


makeHtml :: String -> String -> String
makeHtml title content = html_ ((head_ (title_ title)) <> (body_ content))


myhtml :: String
myhtml = makeHtml "Hello Title" "Hello Body"


main :: IO ()
main = do
  putStrLn myhtml
  putStrLn (makeHtml "TITITITLE" "BODIBODY")
