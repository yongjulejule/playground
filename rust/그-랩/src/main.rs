extern crate grep;

use std::{env, process};

use grep::Config;

fn main() {
    let args = env::args();
    let config = Config::build(args).unwrap_or_else(|err| {
        eprintln!("Problem parsing arguments: {}", err);
        eprintln!("Usage: {} <needle> <filename>", env::args().next().unwrap());
        process::exit(1);
    });

    if let Err(e) = grep::run(config) {
        eprintln!("Application error: {}", e);
        process::exit(1);
    }
}
