const { sqlForPartialUpdate } = require("./sql");

describe("sqlForPartialUpdate", function(){
    test("single value update", function(){
        const result = sqlForPartialUpdate(
            { username: "jo" },
            { username: "uName", lastname: "Tsi" });
        expect(result).toEqual({
            setCols: "\"uName\"=$1",
            values: ["jo"],
        });
    });

    test("Two  value update", function(){
        const result = sqlForPartialUpdate(
            { username: "jo", firstName: "joe" },
            { username: "uName", firstName: "fn" });
        expect(result).toEqual({
            setCols: "\"uName\"=$1, \"fn\"=$2",
            values: ["jo", "joe"]
        });
    });
    
});