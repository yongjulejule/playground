use std::{collections::HashMap, io};

fn get_line() -> String {
    let mut line = String::new();
    io::stdin()
        .read_line(&mut line)
        .expect("Failed to read line");
    return line;
}

#[derive(Debug)]
struct AnswerOne {
    mean: i32,
    median: i32,
    mode: i32,
}

fn solve_one() -> AnswerOne {
    println!("정수 리스트를 입력해주세요. (ex: 1 2 3 4 5) ");
    let mut sum = 0;
    let mut vec = Vec::new();
    let line = get_line();
    let mut element_counter = HashMap::new();
    for word in line.split_whitespace() {
        let num: i32 = word.parse().unwrap();

        element_counter
            .entry(num)
            .and_modify(|e| *e += 1)
            .or_insert(1);

        sum += num;
        vec.push(num);
    }
    vec.sort();

    println!("vec: {:?}", vec);
    println!("element_counter: {:?}", element_counter);

    return AnswerOne {
        mean: sum / vec.len() as i32,
        median: vec[vec.len() / 2],
        mode: element_counter
            .iter()
            .max_by(|a, b| a.1.cmp(b.1))
            .unwrap()
            .0
            .clone(),
    };
}

fn solve_two() -> String {
    let word = get_line().trim().to_string();
    const VOWELS: [char; 5] = ['a', 'e', 'i', 'o', 'u'];

    let mut result = String::new();
    let first_char = word.chars().next().unwrap();
    if VOWELS.contains(&first_char) {
        result.push_str(&word);
        result.push_str("-hay");
    } else {
        result.push_str(&word[1..]);
        result.push('-');
        result.push(first_char);
        result.push_str("ay");
    }
    return result;
}

// - 해쉬맵과 벡터를 이용하여, 사용자가 회사 내의 부서에 대한 피고용인 이름을 추가할 수 있도록 하는
//   텍스트 인터페이스를 만들어보세요.
//   예를들어 “Add Sally to Engineering”이나 “Add Amir to Sales” 같은 식으로요.
//   그후 사용자가 각 부서의 모든 사람들에 대한 리스트나 알파벳 순으로
//   정렬된 부서별 모든 사람에 대한 리스트를 조회할 수 있도록 해보세요.

fn solve_three() {
    let mut map = HashMap::new();
    loop {
        let line = get_line();
        let mut words = line.split_whitespace();
        let command = words.next().unwrap();
        if command == "Add" {
            let name = words.next().unwrap();
            let department = words.next().unwrap().to_string();
            map.entry(department)
                .and_modify(|e: &mut Vec<String>| e.push(name.to_string()))
                .or_insert(vec![name.to_string()]);
        } else if command == "List" {
            let department = words.next().unwrap();
            if department == "All" {
                for (department, names) in &map {
                    println!("{}: {:?}", department, names);
                }
            } else {
                println!("{:?}", map.get(department));
            }
        }
    }
}

fn main() {
    println!("#1 번 문제 , {:?}", solve_one());
    println!("#2 번 문제 , {}", solve_two());
    println!("#3 번 문제 ,");
    solve_three();
}
