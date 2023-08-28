use std::{
    fs::File,
    io::{self, Read},
};

fn 나의_멋진_랜덤(min: i32, max: i32) -> i32 {
    let mut random_device = File::open("/dev/urandom").expect("파일을 열 수 없음");
    let mut random_byte = [0u8; 1];

    random_device
        .read_exact(&mut random_byte)
        .expect("파일을 읽을 수 없음");

    let random_value = random_byte[0] as i32;
    let guess = random_value % (max - min) + min;
    println!("랜덤값: {}, 효율 ㄹㅈㄷ", guess);
    return guess;
}

#[test]
fn 나의_멋진_랜덤_테스트() {
    let mut i = 0;
    println!("얘도 테스트가 데코레이터같은걸로 되네 자스는 왜 안됨? 얼탱");
    while i < 100 {
        let guess = 나의_멋진_랜덤(1, 100);
        assert!(guess >= 1 && guess <= 100);
        i += 1;
    }
}

// @see https://rinthel.github.io/rust-lang-book-ko/ch02-00-guessing-game-tutorial.html
fn main() {
    println!("Guess the number! (-42~42)");
    println!("plz input ur number~ ");

    let mut guess = String::new();

    let result_with_expect = io::stdin()
        // 그 머시기냐 reference 가 원래 불변이니까 가변으로 바꿔서 넘겨줘야하네
        .read_line(&mut guess)
        // 졸라신기함 에러 핸들링 안하고 Result<굿, 쓰레기> 일케 리턴해줌.
        .expect("리드라인은 반성해라");
    println!("expect 를 붙이면 성공했을때 Result<굿> 이 나오고 실패하면 expect 에 있는 에러가 나오면서 터짐.");

    let result_without_expect = io::stdin().read_line(&mut guess);

    println!("{:?} {:?}", result_with_expect, result_without_expect);

    let what = "머야 스트링 Vec<u8> 이네 그럼 프린트 어케함? Vec 에 프린트가 구현되어 있음? 근데 스트링 리터럴은 또 어케받는겨?";
    println!("{}", what);
    let mut i32_vector = Vec::<i32>::new();
    i32_vector.push(1);
    i32_vector.push(2);
    i32_vector.push(3);
    println!("프린트 결과: {:?} 이게되네 대박사건;\n근데 신기한게 push() 도 mut 붙여야 하네? 흠 메모리 주소 관점보다 더 빡썐겨? 걍 암것도 못하나?", i32_vector);

    let i32_immutable_vector = vec![1, 2, 3];

    // i32_vector.print();

    println!("your guessed: {}", guess);

    println!("랜덤을 생성하라는데 /dev/urandom 에서 read_line 한 뒤 숫자로 잘 변환하면 안됨?");
    나의_멋진_랜덤(1, 100);
}
