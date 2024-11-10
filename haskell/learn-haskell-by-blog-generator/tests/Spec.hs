module Main where

import Html.Internal (Structure, append_, code_, el, escape, getStructureString, h1_, html_, ol_, p_, render, ul_)
import Markup (Document, Structure (..))
import Playground (contrivedAdd, even, hello, odd, rep)
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

  describe "markup" $ do
    describe "Document" $ do
      it "is a list of structures" $ do
        let doc :: Document
            doc = [Heading 1 "Header", Paragraph "Content"]
        case doc of
          [Heading level title, Paragraph content] -> do
            level `shouldBe` 1
            title `shouldBe` "Header"
            content `shouldBe` "Content"
          _ -> expectationFailure "Expected a Heading and a Paragraph"

  -- Extra Section for study purposes

  describe "extra section" $ do
    describe "simple summation with curring" $ do
      it "sums two numbers" $ do
        let add :: Int -> Int -> Int
            add x y = x + y
        let add2 = add 2
        add2 3 `shouldBe` 5

  describe "Playground" $ do
    it "should say hello to world" $ do
      hello "world" `shouldBe` "Hello world"
    it "should add given number" $ do
      contrivedAdd 2 3 `shouldBe` 5
    it "should be replicate value" $ do
      rep 3 42 `shouldBe` [42, 42, 42]
    it "should be check even or not" $ do
      Playground.even 2 `shouldBe` True
      Playground.even 1025 `shouldBe` False
    it "should be check odd or not" $ do
      Playground.odd 3 `shouldBe` True
      Playground.odd 65536 `shouldBe` False
