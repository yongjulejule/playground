use std::{error::Error, fs::File, io::Read};

#[derive(Debug, PartialEq)]
pub struct Config {
    pub query: String,
    pub filename: String,
    pub is_case_sensitive: bool,
}

impl Config {
    pub fn build(mut args: impl Iterator<Item = String>) -> Result<Config, &'static str> {
        args.next();
        let query = match args.next() {
            Some(arg) => arg,
            None => return Err("not enough arguments"),
        };

        let filename = match args.next() {
            Some(arg) => arg,
            None => return Err("not enough arguments"),
        };

        let is_case_sensitive = std::env::var("CASE_INSENSITIVE").is_err(); // if set, true
        Ok(Config {
            query,
            filename,
            is_case_sensitive,
        })
    }
}

#[cfg(test)]
mod config_tests {
    use super::Config;
    use std::env;

    #[test]
    fn should_return_config() {
        let query = "쿼리";
        let filename = "이름";

        let v = env::args().chain(vec![String::from(query), String::from(filename)]);

        println!("{:?}", v);
        assert_eq!(
            Config::build(v).unwrap(),
            Config {
                query: String::from(query),
                filename: String::from(filename),
                is_case_sensitive: false,
            }
        );
    }

    #[test]
    fn should_return_err_when_not_enough_arguments() {
        let v = env::args().chain(vec![String::from("실행파일")]);
        assert_eq!(Config::build(v).is_err(), true);
    }

    #[test]
    fn should_not_return_err_when_too_many_arguments() {
        let v = env::args().chain(vec![
            String::from("실행파일"),
            String::from("쿼리"),
            String::from("이름"),
            String::from("뭐야"),
        ]);
        assert_eq!(Config::build(v).is_err(), false);
    }
}

pub fn run(config: Config) -> Result<(), Box<dyn Error>> {
    let mut file = File::open(config.filename)?;
    let mut contents = String::new();
    file.read_to_string(&mut contents)?;

    let result = if config.is_case_sensitive {
        search(&config.query, &contents)
    } else {
        search_case_insensitive(&config.query, &contents)
    };

    result.iter().for_each(|line| {
        println!(
            "{}",
            line.replace(&config.query, &format!("\x1b[31m{}\x1b[0m", config.query))
        );
    });

    Ok(())
}

#[cfg(test)]
mod run_tests {
    use super::run;
    use super::Config;

    #[test]
    fn should_return_err() {
        let config = Config {
            query: String::from("쿼리"),
            filename: String::from("없는 파일"),
            is_case_sensitive: false,
        };
        assert!(run(config)
            .unwrap_err()
            .to_string()
            .starts_with("No such file"));
    }
}

pub fn search<'a>(query: &str, contents: &'a str) -> Vec<&'a str> {
    return contents
        .split("\n")
        .filter(|line| line.contains(query))
        .collect();
}

pub fn search_case_insensitive<'a>(query: &str, contents: &'a str) -> Vec<&'a str> {
    return contents
        .split("\n")
        .filter(|line| line.to_lowercase().contains(&query.to_lowercase()))
        .collect();
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn one_result() {
        let query = "duct";
        let contents = "\
Rust:
safe, fast, productive.
Pick three.";

        assert_eq!(vec!["safe, fast, productive."], search(query, contents));
    }

    #[test]
    fn case_insensitive() {
        let query = "rUsT";
        let contents = "\
Rust:
safe, fast, productive.
Pick three.
Trust me.";

        assert_eq!(
            vec!["Rust:", "Trust me."],
            search_case_insensitive(query, contents)
        );
    }
}
