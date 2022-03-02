class model{
    constructor(){
        this.todolist = JSON.parse(localStorage.getItem("todolist")) || [];
    }

    _commit(todolist){
        this.onListChange(todolist);
        localStorage.setItem("todolist", JSON.stringify(todolist));
    }

    bindonListChange(callback){
        this.onListChange = callback;
    }

    addTask(taskName){
        this.todolist.push({
            id: this.todolist.length>0 ? this.todolist[this.todolist.length-1].id+1: 0,
            task: taskName,
            isCompleted : false
        });
        this._commit(this.todolist);
    }

    editTask(id, updatedTaskname){
        const updatedList = this.todolist.map((tasks) => {
            if(tasks.id===id){
                return({
                    id: tasks.id,
                    task: updatedTaskname,
                    isCompleted: tasks.isCompleted
                })
            }
            else{
                return tasks;
            }
        });

        this.todolist = updatedList;
        this._commit(this.todolist);
    }

    toggleComplete(id){
        const updatedList = this.todolist.map((tasks) => {
            if(tasks.id===id){
                return({
                    id: tasks.id,
                    task: tasks.task,
                    isCompleted: !tasks.isCompleted
                })
            }
            else{
                return tasks;
            }
        });

        this.todolist = updatedList;
        this._commit(this.todolist);
    }

    deleteTask(id){
        const updatedList = this.todolist.filter((tasks) => {
            if(tasks.id!=id){
                return tasks;
            }
        });

        this.todolist = updatedList;
        this._commit(this.todolist);
    }
}

class view{
    constructor(){
        this.heading = document.createElement("h1");
        this.heading.textContent ="todos";

        this.form = document.createElement("form");
        this.form.setAttribute("id", "form");

        this.inputField = document.createElement("input");
        this.inputField.setAttribute("type", "text");
        this.inputField.setAttribute("id", "taskinput");
        this.inputField.placeholder = "Add Taskname...";
        this.inputField.autocomplete ="off";

        this.submitbutton = document.createElement("button");
        this.submitbutton.innerHTML = "Add Task";

        this.form.append(this.inputField);
        this.form.append(this.submitbutton);

        this.todolist = document.createElement("ul");

        this.list = document.createElement("li");

        this.root = document.getElementById("root");
        this.root.append(this.heading, this.form, this.todolist);
        this._temporaryTodoText;
        this._initlistener();
    }

    displayToDo(todos){
        while(this.todolist.firstChild){
            this.todolist.removeChild(this.todolist.firstChild);
        }

        if(todos.length === 0){
            const p = document.createElement("p");
            p.textContent = "Nothing to do! Add a task?";
            this.todolist.append(p);
        }
        else{
            todos.map((todo) => {
                const li = document.createElement("li");
                li.id = todo.id;

                const checkBox = document.createElement("input");
                checkBox.type = "checkbox";
                checkBox.checked = todo.isCompleted;
                checkBox.className = "checkbox";

                const span = document.createElement("span");
                span.contentEditable = true;
                span.classList.add("editable");

                if(todo.isCompleted){
                    const strike = document.createElement("s");
                    strike.textContent = todo.task;
                    span.append(strike);
                }
                else{
                    span.textContent = todo.task;
                }

                const deletButton = document.createElement("button");
                deletButton.className="delete";
                deletButton.innerHTML = "Delete";

                li.append(checkBox, span, deletButton);
                this.todolist.append(li);
            });
        }
    }

    get _todoText(){
        return this.inputField.value;
    }

    _resetInput(){
        this.inputField.value = "";
    }

    _initlistener(){
        this.todolist.addEventListener("input", (event) => {
            if(event.target.className === "editable"){
                this._temporaryTodoText = event.target.innerText;
            }
        })
    }

    bindAddTask(handler){
        this.form.addEventListener("submit", (event) => {
            event.preventDefault();

            if(this._todoText){
                handler(this._todoText);
                this._resetInput();
            }
        });
    }

    bindToogleComplete(handler){
        this.todolist.addEventListener("click", (event) => {
            if(event.target.type === "checkbox"){
                const id = parseInt(event.target.parentNode.id);
                handler(id);
            }
        })
    }

    bindDelete(handler){
        this.todolist.addEventListener("click", (event) => {
            if(event.target.className === "delete"){
                console.log("in");
                const id = parseInt(event.target.parentNode.id);;
                handler(id);
            }
        })
    }

    bindUpdate(handler){
        this.todolist.addEventListener("focusout", (event) => {
            if(event.target.className==="editable" && this._temporaryTodoText){
                const id = parseInt(event.target.parentNode.id);

                handler(id, this._temporaryTodoText);
            }
        });
    }
}

class controller{
    constructor(model, view){
        this.model = model;
        this.view = view;

       this.onTodolistChange(this.model.todolist);
       this.view.bindAddTask(this.onAddtask);
       this.view.bindDelete(this.onDeleteTask);
       this.view.bindToogleComplete(this.onToggleComplete);
       this.view.bindUpdate(this.onUpdate);
       this.model.bindonListChange(this.onTodolistChange);
    }

    onTodolistChange = (todo) =>{
        this.view.displayToDo(todo);
    }

    onUpdate = (id, value) =>{
        this.model.editTask(id, value);
    }

    onAddtask = (todo) => {
        this.model.addTask(todo);
    }

    onDeleteTask = (id) => {
        this.model.deleteTask(id);
    }

    onToggleComplete = (id) => {
        this.model.toggleComplete(id);
    }
}

let Controller = new controller(new model(), new view());