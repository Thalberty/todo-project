import * as uuid from 'uuid'

import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
import { TodoAccess } from '../dataLayer/todoAccess'
// import { CreateGroupRequest } from '../requests/CreateGroupRequest'
import { parseUserId } from '../auth/utils'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
const XAWS = AWSXRay.captureAWS(AWS)
const bucketName = process.env.IMAGES_S3_BUCKET
const todoAccess = new TodoAccess()

const s3 = new XAWS.S3({
  signatureVersion: 'v4'
})

export async function getAllTodoItem(userId: string): Promise<TodoItem[]> {
  return todoAccess.getAllTodoItem(userId)
}

export async function createTodo(
  CreateTodoRequest: CreateTodoRequest,
  jwtToken: string
): Promise<TodoItem> {

  const itemId = uuid.v4()
  const userId = parseUserId(jwtToken)

  return await todoAccess.createTodoItem({
    userId: userId,
    todoId: itemId,
    createdAt: new Date().toISOString(),
    name: CreateTodoRequest.name,
    dueDate: CreateTodoRequest.dueDate,
    done: false
  })
}

export async function updateTodo(
  UpdateTodoRequest: UpdateTodoRequest,
  todoId: string,
  jwtToken: string
): Promise<TodoUpdate> {

  // const itemId = uuid.v4()
  const userId = parseUserId(jwtToken)

  return await todoAccess.updateTodoItem(UpdateTodoRequest, userId, todoId)
}

export async function updateImageTodo(
  todoId: string,
  userId: string
){

  const imageId = uuid.v4()
  const url = getUploadUrl(imageId)
  await todoAccess.updateTodoImage(todoId, userId, imageId)

  return url
}

export async function deleteTodo(
  todoId: string,
  jwtToken: string
): Promise<string> {

  const userId = parseUserId(jwtToken)

  return await todoAccess.deleteTodoItem(userId, todoId)
}

function getUploadUrl(imageId: string) {
  return s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: imageId,
    Expires: 300
  })
}