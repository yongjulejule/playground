class Student {
	fullName: string;
	constructor(public firstName: string, public middleInitial: string, private lastName: string) {
			this.fullName = firstName + " " + middleInitial + " " + lastName;
	}
}

interface Person {
	firstName: string;
	lastName: string;
}

function greeter(person: Person) {
	return "Hello, " + person.firstName + " " + person.lastName;
}

let user = new Student("Jane", "M.", "User");

console.log(user)

enum real { a, b, c}

const a : string = real[0];

console.log(a);

console.log(`hi${a}` )

function printLabel(labeledObj: { label: string }) {
	console.log(labeledObj.label);
}

let myObj = {size: 10, label: "Size 10 Object"};
printLabel(myObj);

let b : any = 10



printLabel({label: b })
printLabel({label: b })



interface StringIntArr {
	[index: string]: number;
}

let myArray: StringIntArr = {
	"Hello": 10,
	"World": 20
};

console.log(myArray["Hello"], myArray["World"]);


class Animal {
	private name: string;
	constructor(theName: string) { this.name = theName; }
}

class Rhino extends Animal {
	constructor() { super("Rhino");  }
}

console.log(Animal)
console.log(Rhino);

class Employee {
	private name: string;
	constructor(theName: string) { this.name = theName; }
}

let animal = new Animal("Goat");
let rhino = new Rhino();
let employee = new Employee("Bob");

animal = rhino;
// animal = employee; // 오류: 'Animal'과 'Employee'은 호환될 수 없음.

abstract class aAnimal {
	abstract makeSound(): void;
	move(): void {
			console.log("roaming the earth...");
	}
}

function identity<T>(arg: T): T {
	console.log(typeof arg);
	return arg;
}

function identityAny(arg: any): any {
	console.log(typeof arg);
	return arg;
}

let o1 : string = identity<string>("hi");
console.log("o1: " , o1);
let oany: any = identityAny("hi");
console.log("oany: " ,oany);

function loggingIdentity<T>(arg: Array<T> | string): Array<T> | string {
  console.log(arg.length); 
  return arg;
}

console.log(loggingIdentity<string>("hirukk"));

