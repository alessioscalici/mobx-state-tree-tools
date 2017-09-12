

import { types } from "mobx-state-tree"


const Number = types.model("Number", {
    id: types.identifier(types.string),
    num: 0
})


const Timer = types.model("Timer", {
    id: types.identifier(types.string),
    value: 0,
    random: types.array(Number),
    prevValues: types.array(Number)
}, {
    increment() {

        this.prevValues.push({ id: 'fake_id', num: this.value} );

        this.value++;

        this.random[0].num = Math.random()*10
    },
    decrement(amount) {
        this.prevValues.push({ id: 'fake_id', num: this.value});
        this.value -= amount || 1;

        this.random[0].num = Math.random()*10
    },
    reset() {
        this.prevValues.length = 0;
        this.value = 0;
    }
})


const Store = types.model("Store", {

    timer: Timer,
        frozen: types.frozen
},

    {
        popValue() {
            this.timer.prevValues.pop();
        }
    })

// create an instance from a snapshot
const store = Store.create({  timer: {id: 'timerId', value: 0, prevValues: [], random: [{id:'RAND_0',num: 7}, {id:'RAND_1',num: 7}]}, frozen:
    {
        nullValue: null,
        undefinedValue: undefined,
        nanValue: NaN,
        turValue: true,
        falseValue: false,
        zeroValue: 0,
        intValue: 1234,
        negIntValue: -1,
        stringValue: 'hello',
        emptyStringValue: '',
        dateValue: new Date(),
        objectValue: {
            regExpLiteral: /[a-z]/i,
            regExpObject: new RegExp('[.*]', 'g')
        },
        arrayValue: [1, 2, 3],
        arrayObjects: [ { name: 'pippo' }, { name: 'pippo' }, { withChild: { name: 'pippo' } }]
    }
})


export default store