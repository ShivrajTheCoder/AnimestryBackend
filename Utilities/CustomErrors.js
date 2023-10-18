exports.CustomError=class extends Error{
    constructor(status,message,type){
        super(message);
        this.status=status;
        this.type=type;
    }
}
exports.CredentialError = class extends exports.CustomError {
    constructor(message) {
        super(400,`${message} is invalid`, "CredentialError")
    }
}
exports.NotFoundError=class extends exports.CustomError{
    constructor(message){
        super(404,message,"Not Found Error");
    }
}
exports.AuthenticationError=class extends exports.CustomError{
    constructor(message){
        super(401,`You are not authorized ${message}`,"Authentication Error");
    }
}
exports.DuplicateDataError=class extends exports.CustomError{
    constructor(message){
        super(403,`Data Already Exists`,"Duplicate Data Error");
    }
}