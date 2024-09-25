-- <name> <arg1> <arg2> ... <argN> = <expression> for function

-- <> operator can concatenate two string
-- wrapHtml content = "<html><body>" <> content <> "</body></html>"


html_ content = "<html>" <> content <> "</html>"
head_ content = "<head>" <> content <> "</head>"
title_ content = "<title>" <> content <> "</title>"
body_ content = "<body>" <> content <> "</body>"

wrapHtml content = html_ (body_ content)

makeHtml title content = html_ ((head_ (title_ title)) <> (body_ content))

myhtml = makeHtml "Hello Title" "Hello Body"

main = putStrLn myhtml
