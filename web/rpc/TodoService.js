import { withTwirp, TwirpService } from "./twirp";

export const ListTodos = withTwirp(
  class ListTodos extends TwirpService {
    constructor(props) {
      super("todos.v1.TodoService/ListTodos", props);
    }
  }
);

export const CreateTodo = withTwirp(
  class CreateTodo extends TwirpService {
    constructor(props) {
      super("todos.v1.TodoService/CreateTodo", props);
    }
  }
);
