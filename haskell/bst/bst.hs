
-- Binary Search Tree data structure
data BST = Empty | Node String BST BST deriving (Show, Eq)

-- Function to insert an element into the BST
insert :: String -> BST -> BST
insert x Empty = Node x Empty Empty
insert x (Node v left right)
    | x < v     = Node v (insert x left) right
    | x > v     = Node v left (insert x right)
    | otherwise = Node v left right  -- Ignore duplicates

-- Function to search for an element in the BST
search :: String -> BST -> Bool
search _ Empty = False
search x (Node v left right)
    | x == v    = True
    | x < v     = search x left
    | otherwise = search x right

-- Function to insert a list of elements into the BST
insertAll :: [String] -> BST -> BST
insertAll [] bst = bst
insertAll (x:xs) bst = insertAll xs (insert x bst)

-- Example main function
main :: IO ()
main = do
    -- List of 20 strings to insert into the BST
    let elements = ["apple", "orange", "banana", "grape", "pear", "peach", "plum", "kiwi", "mango", "lime", 
                    "lemon", "cherry", "blueberry", "strawberry", "blackberry", "raspberry", "watermelon", 
                    "cantaloupe", "pineapple", "papaya"]

    -- Create an empty BST
    let bst = insertAll elements Empty

    -- Ask user for a string to search
    putStrLn "Enter a string to search in the BST:"
    searchString <- getLine

    -- Search for the string in the BST
    if search searchString bst
        then putStrLn $ searchString ++ " was found in the BST!"
        else putStrLn $ searchString ++ " was not found in the BST."
