import * as admin from 'firebase-admin';
const db = admin.firestore();

export class Database
{
    addToDb(collection: string, document: any, data: any){

        let query = db.collection(collection).doc();
        if(document)
        {
            query = db.collection(collection).doc(document);
        }

        query.set(data)
            .then(function(){
                console.log("Add to database confirmed!");
            })
            .catch(function(error){
                console.error("Error while adding to database: " + error);
            });
    }

    removeFromDb(collection: string, document: string){

        let query = db.collection(collection).doc(document);

        query.delete()
            .then(function(){
                console.log("Data removed from DB!");
            })
            .catch(function(error){
                console.error("Error while removing from database: " + error);
            });
    }

    /*
    getFromDb(collection: string, document: string, filter?:any)
    {
        let query = db.collection(collection).doc(document);
        query.get()
    }
    */
}