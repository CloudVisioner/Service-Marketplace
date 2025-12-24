// TASK ZJ:

// Shunday function yozing, u berilgan array ichidagi
// raqamlarni qiymatini hisoblab qaytarsin.

// MASALAN: reduceNestedArray([1, [1, 2, [4]]]); return 8;

// Yuqoridagi misolda, array nested bo'lgan holdatda ham,
// bizning function ularning yig'indisini hisoblab qaytarmoqda.

let arr = [1, [1, 2]]

function reduceNestedArray(arr) {
    const sum = arr.flat(Infinity).reduce((accumulator, currentVal) => {
        return accumulator + currentVal
    }, 0)
    return sum
    }
console.log(reduceNestedArray(arr))



// TASK ZI

// Shundan function yozing, bu function 3 soniydan so'ng
// "Hello World!" so'zini qaytarsin.

// MASALAN: delayHelloWorld("Hello World"); return "Hello World";

// function delayedHelloWorld() {
//     return setTimeout(() => {
//         console.log("Hello Wolrd");
//     }, 3000)
// }
// delayedHelloWorld();

