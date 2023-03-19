const k = 3
const machine = new kNear(k)

// training - todo: meerdere voorbeelden voor cats en dogs nodig!
machine.learn([11, 5, 10], 'cat')
machine.learn([14, 8, 12], 'dog')
machine.learn([12, 6, 8], 'cat')
machine.learn([16, 10, 14], 'dog')
machine.learn([10, 4, 8], 'cat')
machine.learn([13, 9, 11], 'dog')
machine.learn([9, 3, 7], 'cat')
machine.learn([15, 11, 13], 'dog')

// predicting
let prediction = machine.classify([13, 3, 2])
console.log(`I think it's a ${prediction}`)