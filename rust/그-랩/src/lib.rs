use std::{error::Error, fs::File, io::Read};

#[derive(Debug, PartialEq)]
pub struct Config {
    pub query: String,
    pub filename: String,
    pub is_case_sensitive: bool,
}

impl Config {
    pub fn new(args: &[String]) -> Result<Config, &'static str> {
        if args.len() < 3 {
            return Err("not enough arguments");
        } else if args.len() > 3 {
            return Err("too many arguments");
        }

        let is_case_sensitive = std::env::var("CASE_INSENSITIVE").is_err(); // if set, true
        Ok(Config {
            query: args[1].clone(),
            filename: args[2].clone(),
            is_case_sensitive,
        })
    }
}

#[cfg(test)]
mod config_tests {
    use super::Config;

    #[test]
    fn should_return_config() {
        let query = "쿼리";
        let filename = "이름";
        assert_eq!(
            Config::new(&[
                String::from("실행파일"),
                String::from(query),
                String::from(filename)
            ])
            .unwrap(),
            Config {
                query: String::from(query),
                filename: String::from(filename),
                is_case_sensitive: false,
            }
        );
    }

    #[test]
    fn should_return_err_when_not_enough_arguments() {
        assert_eq!(
            Config::new(&[String::from("실행파일"), String::from("쿼리")]).unwrap_err(),
            "not enough arguments"
        );
    }

    #[test]
    fn should_return_err_when_too_many_arguments() {
        assert_eq!(
            Config::new(&[
                String::from("실행파일"),
                String::from("쿼리"),
                String::from("이름"),
                String::from("Trash")
            ])
            .unwrap_err(),
            "too many arguments"
        );
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

    for line in result {
        println!(
            "{}",
            line.replace(&config.query, &format!("\x1b[31m{}\x1b[0m", config.query))
        );
    }

    // contents.split("\n").for_each(|line| {
    //     if line.contains(&config.query) {
    //         println!(
    //             "{}",
    //             line.replace(&config.query, &format!("\x1b[31m{}\x1b[0m", config.query))
    //         );
    //     }
    // });

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
    // contents
    //     .split("\n")
    //     .filter(|line| line.contains(query))
    //     .collect()

    let mut results = Vec::new();

    for line in contents.lines() {
        if line.contains(query) {
            results.push(line);
        }
    }

    return results;
}

pub fn search_case_insensitive<'a>(query: &str, contents: &'a str) -> Vec<&'a str> {
    let query = query.to_lowercase();
    let mut results = Vec::new();

    for line in contents.lines() {
        if line.to_lowercase().contains(&query) {
            results.push(line);
        }
    }

    return results;
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
