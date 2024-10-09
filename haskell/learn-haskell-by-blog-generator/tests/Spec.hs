-- tests/Spec.hs
import Test.Hspec
import Html

main :: IO ()
main = hspec $ do
  describe "addition" $ do
    it "1 + 1 is 2" $ do
      (1 + 1) `shouldBe` 2
