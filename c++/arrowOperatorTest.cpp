#include <cstdio>
#include <typeinfo>

// class E {
//  public:
//   E() : a(42) {}
//   int a;
//   E* operator->() {
//     std::cout << "A operator->" << std::endl;
//     return this;
//   }
// };

// class D {
//  public:
//   E operator->() {
//     std::cout << "D operator->" << std::endl;
//     return E();
//   }
// };
// class C {
//  public:
//   D operator->() {
//     std::cout << "C operator->" << std::endl;
//     return D();
//   }
// };

// class B {
//  public:
//   C operator->() {
//     std::cout << "B operator->" << std::endl;
//     return C();
//   }
// };
class A {
 public:
  const static int a = 1;
  A operator->() {
    printf("A operator->\n");
    return *this;
  }
  A& operator=(const A& a) {
    printf("A operator=\n");
    return *this;
  }
};
int main() {
  A objA;
  printf("%s\n", typeid(A().operator->()).name());
  // printf("%d\n", A().operator->().a);
}
