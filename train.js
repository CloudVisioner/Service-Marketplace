// Shunday function yozing, u parametridagi array ichida 2 marta qaytarilgan sonlarni alohida araryda qaytarsin.
// MASALAN: findDuplicates([1,2,3,4,5,4,3,4]) return [3, 4]

const list = [1, 2, 3, 4, 5, 4, 3, 4];

function findDuplicates(arr) {
	let note = [];
	let list = [];
	for (let i = 0; i < arr.length; i++) {
		if (!list.includes(arr[i])) {
			list.push(arr[i]);
		} else {
			note.push(arr[i]);
		}
	}
	return note;
}

console.log(findDuplicates(list));
// TASK-ZP:

// Shunday function yozing, u parametridagi string ichidagi raqam va sonlarni sonini sanasin.
// MASALAN: countNumberAndLetters(“string152%\¥”) return {number:3, letter:6}

// function countNumberAndLetters(string) {
// 	let number = 0;
// 	let letter = 0;
// 	for (let i = 0; i < string.length; i++) {
// 		if (string[i] >= '0' && string[i] <= '9') {
// 			number++;
// 		} else if ((string[i] >= 'A' && string[i] <= 'Z') || (string[i] >= 'a' && string[i] <= 'z')) {
// 			letter++;
// 		}
// 	}
// 	return {
// 		number: number,
// 		letter: letter,
// 	};
// }

// console.log(countNumberAndLetters('dfjh2h4huffu7f3@@@@'));

// TASK-ZP:

// Shunday function yozing, u parametridagi string ichidagi raqam va sonlarni sonini sanasin.
// MASALAN: countNumberAndLetters(“string152%\¥”) return {number:3, letter:6}

// function areParenthesesBalanced(str) {
//   let balance = 0;

//   for (const char of str) {
//     if (char === '(') balance++;
//     if (char === ')') balance--;

//     // Agar yopuvchi qavs oldin kelib qolsa
//     if (balance < 0) return false;
//   }

//   // Oxirida balans nol bo‘lishi kerak
//   return balance === 0;
// }
// console.log(areParenthesesBalanced("string()ichida(qavslar)soni()balansda"))

// TASK ZJ:

// Shunday function yozing, u berilgan array ichidagi
// raqamlarni qiymatini hisoblab qaytarsin.

// MASALAN: reduceNestedArray([1, [1, 2, [4]]]); return 8;

// Yuqoridagi misolda, array nested bo'lgan holdatda ham,
// bizning function ularning yig'indisini hisoblab qaytarmoqda.

// let arr = [1, [1, 2]]

// function reduceNestedArray(arr) {
//     const sum = arr.flat(Infinity).reduce((accumulator, currentVal) => {
//         return accumulator + currentVal
//     }, 0)
//     return sum
//     }
// console.log(reduceNestedArray(arr))

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
