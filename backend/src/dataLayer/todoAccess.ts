import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
import * as AWSXRay from 'aws-xray-sdk'
const XAWS = AWSXRay.captureAWS(AWS)

export class TodoAccess {
  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly bucketName = process.env.IMAGES_S3_BUCKET) {
  }

  async getAllTodoItem(userId: string): Promise<TodoItem[]> {
    console.log('Getting all todo')

    const result = await this.docClient.query({
      TableName: this.todosTable,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: { 
        ':userId': userId 
      }
    }).promise()

    const items = result.Items
    return items as TodoItem[]
  }

  async createTodoItem(todo: TodoItem): Promise<TodoItem> {
    await this.docClient.put({
      TableName: this.todosTable,
      Item: todo
    }).promise()

    return todo
  }

  async updateTodoItem(todo: TodoUpdate, userId: string, todoId: string): Promise<TodoUpdate> {
    await this.docClient.update({
      TableName: this.todosTable,
      Key: {
        userId: userId,
        todoId: todoId
      },
      ExpressionAttributeNames: { "#N": "name" },
      UpdateExpression: "set #N=:todoName, dueDate=:dueDate, done=:done",
      ExpressionAttributeValues: {
        ":todoName": todo.name,
        ":dueDate": todo.dueDate,
        ":done": todo.done
      },
      ReturnValues: "UPDATED_NEW"
    }).promise();

    return todo
  }

  async updateTodoImage(userId: string, todoId: string, imageId: string): Promise<string> {
    const imageUrl = `https://${this.bucketName}.s3.amazonaws.com/${imageId}`
    await this.docClient.update({
      TableName: this.todosTable,
      Key: {
        userId: userId,
        todoId: todoId
      },
      UpdateExpression: "set attachmentUrl=:attachmentUrl",
      ExpressionAttributeValues: {
        ":attachmentUrl": imageUrl
      },
      ReturnValues: "UPDATED_NEW"
    }).promise();

    return imageUrl
  }

  async deleteTodoItem(userId: string, todoId: string): Promise<string> {
    await this.docClient.delete({
      TableName: this.todosTable,
      Key: {
        userId: userId,
        todoId: todoId
      }
    }).promise()

    return todoId
  }

}

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    console.log('Creating a local DynamoDB instance')
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8008'
    })
  }

  return new XAWS.DynamoDB.DocumentClient()
}
