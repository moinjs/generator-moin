moin.on({
    event: "test",
    x: 5,
    y: (y)=>y > 5
}, (event)=> {
    return "x + y = " + (event.x + event.y);
});

moin.on({
    event: "test"
}, (event)=> {
    if (event.z == 0)throw "Can not divide by 0";
});

moin.on({
    event: "test"
}, (event)=> {
    return new Promise((resolve)=> {
        setTimeout(()=>resolve("x * y = " + (event.x * event.y)), 1000);
    });
});

moin.emit("test", {
    x: 5,
    y: 10,
    z: 0
}).then(({values,errors,stats})=> {
    console.log(`received the values [${values.join(", ")}] and the errors [${errors.join(", ")}]`);
});

moin.registerUnloadHandler(()=> {
    console.log("Bye");
});