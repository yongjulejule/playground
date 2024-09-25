main = do
  putStrLn "Hello, everybody!"
  putStrLn ("Please look my favorite prime number: " ++ show(2^61 - 1))
  getLine >>= putStrLn . ("Hello, " ++) . (++ "!") 
