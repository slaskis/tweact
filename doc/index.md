# Protocol Documentation
<a name="top"></a>

## Table of Contents

- [demo/service.proto](#demo/service.proto)
    - [EchoRequest](#demo.EchoRequest)
    - [EchoResponse](#demo.EchoResponse)
  
    - [Test](#demo.Test)
  
  
    - [DemoService](#demo.DemoService)
  

- [todos/v1/types.proto](#todos/v1/types.proto)
    - [Todo](#todos.v1.Todo)
  
    - [TodoState](#todos.v1.TodoState)
  
  
  

- [todos/v1/service.proto](#todos/v1/service.proto)
    - [CreateTodoRequest](#todos.v1.CreateTodoRequest)
    - [GetTodoRequest](#todos.v1.GetTodoRequest)
    - [ListTodoResponse](#todos.v1.ListTodoResponse)
    - [ListTodosRequest](#todos.v1.ListTodosRequest)
    - [RemoveTodoRequest](#todos.v1.RemoveTodoRequest)
    - [TodoResponse](#todos.v1.TodoResponse)
  
  
  
    - [TodoService](#todos.v1.TodoService)
  

- [Scalar Value Types](#scalar-value-types)



<a name="demo/service.proto"></a>
<p align="right"><a href="#top">Top</a></p>

## demo/service.proto



<a name="demo.EchoRequest"></a>

### EchoRequest
EchoRequest only passes a message


| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| message | [string](#string) |  | message to echo |






<a name="demo.EchoResponse"></a>

### EchoResponse
EchoResponse only contains a message


| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| message | [string](#string) |  | message that was in the request |





 


<a name="demo.Test"></a>

### Test
TestEnum has a comment

| Name | Number | Description |
| ---- | ------ | ----------- |
| UNKNOWN | 0 |  |
| HELLO | 1 | So does this value |
| THERE | 2 | and trailing |


 

 


<a name="demo.DemoService"></a>

### DemoService
DemoService shows a very simple service with only
an Echo method.

| Method Name | Request Type | Response Type | Description |
| ----------- | ------------ | ------------- | ------------|
| Echo | [EchoRequest](#demo.EchoRequest) | [EchoResponse](#demo.EchoResponse) | Echo responds with the message passed into the request. Useful for testing and as a minimal example. |

 



<a name="todos/v1/types.proto"></a>
<p align="right"><a href="#top">Top</a></p>

## todos/v1/types.proto



<a name="todos.v1.Todo"></a>

### Todo



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [string](#string) |  |  |
| title | [string](#string) |  |  |
| state | [TodoState](#todos.v1.TodoState) |  |  |





 


<a name="todos.v1.TodoState"></a>

### TodoState


| Name | Number | Description |
| ---- | ------ | ----------- |
| UNKNOWN | 0 |  |
| ARCHIVED | 1 |  |
| ACTIVE | 2 |  |


 

 

 



<a name="todos/v1/service.proto"></a>
<p align="right"><a href="#top">Top</a></p>

## todos/v1/service.proto



<a name="todos.v1.CreateTodoRequest"></a>

### CreateTodoRequest



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| title | [string](#string) |  |  |






<a name="todos.v1.GetTodoRequest"></a>

### GetTodoRequest



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [string](#string) |  |  |






<a name="todos.v1.ListTodoResponse"></a>

### ListTodoResponse



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| todos | [Todo](#todos.v1.Todo) | repeated |  |






<a name="todos.v1.ListTodosRequest"></a>

### ListTodosRequest







<a name="todos.v1.RemoveTodoRequest"></a>

### RemoveTodoRequest



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [string](#string) |  |  |






<a name="todos.v1.TodoResponse"></a>

### TodoResponse



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| todo | [Todo](#todos.v1.Todo) |  |  |





 

 

 


<a name="todos.v1.TodoService"></a>

### TodoService


| Method Name | Request Type | Response Type | Description |
| ----------- | ------------ | ------------- | ------------|
| CreateTodo | [CreateTodoRequest](#todos.v1.CreateTodoRequest) | [TodoResponse](#todos.v1.TodoResponse) |  |
| RemoveTodo | [RemoveTodoRequest](#todos.v1.RemoveTodoRequest) | [TodoResponse](#todos.v1.TodoResponse) |  |
| GetTodo | [GetTodoRequest](#todos.v1.GetTodoRequest) | [TodoResponse](#todos.v1.TodoResponse) |  |
| ListTodos | [ListTodosRequest](#todos.v1.ListTodosRequest) | [ListTodoResponse](#todos.v1.ListTodoResponse) |  |

 



## Scalar Value Types

| .proto Type | Notes | C++ Type | Java Type | Python Type |
| ----------- | ----- | -------- | --------- | ----------- |
| <a name="double" /> double |  | double | double | float |
| <a name="float" /> float |  | float | float | float |
| <a name="int32" /> int32 | Uses variable-length encoding. Inefficient for encoding negative numbers – if your field is likely to have negative values, use sint32 instead. | int32 | int | int |
| <a name="int64" /> int64 | Uses variable-length encoding. Inefficient for encoding negative numbers – if your field is likely to have negative values, use sint64 instead. | int64 | long | int/long |
| <a name="uint32" /> uint32 | Uses variable-length encoding. | uint32 | int | int/long |
| <a name="uint64" /> uint64 | Uses variable-length encoding. | uint64 | long | int/long |
| <a name="sint32" /> sint32 | Uses variable-length encoding. Signed int value. These more efficiently encode negative numbers than regular int32s. | int32 | int | int |
| <a name="sint64" /> sint64 | Uses variable-length encoding. Signed int value. These more efficiently encode negative numbers than regular int64s. | int64 | long | int/long |
| <a name="fixed32" /> fixed32 | Always four bytes. More efficient than uint32 if values are often greater than 2^28. | uint32 | int | int |
| <a name="fixed64" /> fixed64 | Always eight bytes. More efficient than uint64 if values are often greater than 2^56. | uint64 | long | int/long |
| <a name="sfixed32" /> sfixed32 | Always four bytes. | int32 | int | int |
| <a name="sfixed64" /> sfixed64 | Always eight bytes. | int64 | long | int/long |
| <a name="bool" /> bool |  | bool | boolean | boolean |
| <a name="string" /> string | A string must always contain UTF-8 encoded or 7-bit ASCII text. | string | String | str/unicode |
| <a name="bytes" /> bytes | May contain any arbitrary sequence of bytes. | string | ByteString | str |

