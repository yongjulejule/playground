pub fn add(left: usize, right: usize) -> usize {
    left + right
}

#[derive(Debug)]
pub struct Rectangle {
    length: u32,
    width: u32,
}

impl Rectangle {
    pub fn can_hold(&self, other: &Rectangle) -> bool {
        self.length > other.length && self.width > other.width
    }
}

pub struct Guess {
    value: u32,
}

impl Guess {
    pub fn new(value: u32) -> Guess {
        if value < 1 {
            panic!(
                "Guess value must be greater than or equal to 1, got {}.",
                value
            );
        } else if value > 100 {
            panic!(
                "Guess value must be less than or equal to 100, got {}.",
                value
            );
        } else if value == 42 {
            panic!("The Answer is 42, no matter how you write it");
        }

        Guess { value }
    }
}

// unit test. Executed by `cargo test`. cfg stands for configuration.
#[cfg(test)]
mod tests {
    use super::add;

    #[test]
    fn it_works() {
        for i in 0..100_000 {
            let result = add(i, 2);
            assert_eq!(result, i + 2);
        }
    }

    #[test]
    #[ignore]
    fn it_should_not_works() {
        assert_eq!(
            42,
            0b101010 + 0o52 + 0x2a,
            "42 is 42, no matter how you write it"
        )
    }
}

#[cfg(test)]
mod rectangle_tests {
    use super::Rectangle;

    #[test]
    fn larger_can_hold_smaller() {
        let larger = Rectangle {
            length: 8,
            width: 7,
        };
        let smaller = Rectangle {
            length: 5,
            width: 1,
        };

        assert!(larger.can_hold(&smaller));
    }

    #[test]
    fn smaller_cannot_hold_larger() {
        let larger = Rectangle {
            length: 8,
            width: 7,
        };
        let smaller = Rectangle {
            length: 5,
            width: 1,
        };

        assert!(!smaller.can_hold(&larger));
    }
}

#[cfg(test)]
mod guess_tests {
    use super::Guess;

    #[test]
    #[should_panic(expected = "Guess value must be less than or equal to 100, got 200.")]
    fn greater_than_100() {
        Guess::new(200);
    }

    #[test]
    #[should_panic(expected = "The Answer is 42, no matter how you write it")]
    fn the_42_is_panic() {
        Guess::new(42);
    }
}
