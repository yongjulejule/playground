class Student {
	constructor(firstName, middleInitial, lastName) {
		this.firstName = firstName;
		this.middleInitial = middleInitial;
		this.lastName = lastName;
		this.fullName = firstName + " " + middleInitial + " " + lastName;
	}
}
function greeter(person) {
	return "Hello, " + person.firstName + " " + person.lastName;
}
let user = new Student("Jane", "M.", "User");
console.log(user);
var real;
(function (real) {
	real[real["a"] = 0] = "a";
	real[real["b"] = 1] = "b";
	real[real["c"] = 2] = "c";
})(real || (real = {}));
const a = real[0];
console.log(a);
console.log(`hi${a}`);
function printLabel(labeledObj) {
	console.log(labeledObj.label);
}
let myObj = { size: 10, label: "Size 10 Object" };
printLabel(myObj);
let b = 10;
printLabel({ label: b });
printLabel({ label: b });
let myArray = {
	"Hello": 10,
	"World": 20
};
console.log(myArray["Hello"], myArray["World"]);
class Animal {
	constructor(theName) { this.name = theName; }
}
class Rhino extends Animal {
	constructor() { super("Rhino"); }
}
console.log(Animal);
console.log(Rhino);
class Employee {
	constructor(theName) { this.name = theName; }
}
let animal = new Animal("Goat");
let rhino = new Rhino();
let employee = new Employee("Bob");
animal = rhino;
// animal = employee; // 오류: 'Animal'과 'Employee'은 호환될 수 없음.
class aAnimal {
	move() {
		console.log("roaming the earth...");
	}
}

//# sourceMappingURL=gretter.js.map
