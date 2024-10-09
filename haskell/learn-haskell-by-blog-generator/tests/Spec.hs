module Main where

import Html.Internal (Structure, append_, code_, el, escape, getStructureString, h1_, html_, ol_, p_, render, ul_)
import Test.Hspec

main :: IO ()
main = hspec $ do
  describe "Html.Internal" $ do
    describe "escape" $ do
      it "escapes special characters" $ do
        escape "<>&\"'" `shouldBe` "&lt;&gt;&amp;&quot;&apos;"
        escape "Hello, World!" `shouldBe` "Hello, World!"
        escape "<title> HI TITLE </tile>" `shouldBe` "&lt;title&gt; HI TITLE &lt;/tile&gt;"

    describe "el" $ do
      it "wraps content in HTML tags" $ do
        el "p" "Hello" `shouldBe` "<p>Hello</p>"

    describe "p_" $ do
      it "creates a paragraph structure" $ do
        getStructureString (p_ "Hello") `shouldBe` "<p>Hello</p>"

    describe "code_" $ do
      it "creates a code block structure" $ do
        getStructureString (code_ "print('Hello')") `shouldBe` "<pre>print(&apos;Hello&apos;)</pre>"

    describe "h1_" $ do
      it "creates a header structure" $ do
        getStructureString (h1_ "Header") `shouldBe` "<h1>Header</h1>"

    describe "ul_" $ do
      it "creates an unordered list structure" $ do
        getStructureString (ul_ [p_ "Item 1", p_ "Item 2"]) `shouldBe` "<ul><li><p>Item 1</p></li><li><p>Item 2</p></li></ul>"

    describe "ol_" $ do
      it "creates an ordered list structure" $ do
        getStructureString (ol_ [p_ "Item 1", p_ "Item 2"]) `shouldBe` "<ol><li><p>Item 1</p></li><li><p>Item 2</p></li></ol>"

    describe "append_" $ do
      it "appends two structures" $ do
        getStructureString (append_ (p_ "Hello") (p_ "World")) `shouldBe` "<p>Hello</p><p>World</p>"

    describe "html_" $ do
      it "creates an HTML document" $ do
        render (html_ "Title" (p_ "Content")) `shouldBe` "<html><head><title>Title</title></head><body><p>Content</p></body></html>"
