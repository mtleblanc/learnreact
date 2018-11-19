import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { createStore, applyMiddleware } from 'redux'
import { Provider, connect } from 'react-redux'

/* Section: Reducers and Action Creators */

const TimerReducer = (state, action) => {
  if(state && action.id !== state.id) return state;
  switch (action.type) {
    case 'START':
      if(state.startTime !== null) return state;
      else return { ...state, startTime: new Date() };
    case 'STOP':
      if(state.startTime === null) return state;
      else return { ...state, startTime: null, elapsed: state.elapsed + (new Date() - state.startTime) };
    case 'RENAME':
      return { ...state, title: action.title, project: action.project };
    case 'CREATE':
      return { id: action.id, title: action.title || '', project: action.project || '', elapsed: 0, startTime: null};
    default: return state;
  }
};

const TimersReducer = (state = [], action) => {
  switch (action.type) {
    case 'SET_STATE':
      return action.state;
    case 'CREATE': 
      return [ ...state, TimerReducer(null, action) ];
    case 'DELETE' : 
      return state.filter(s=>s.id !== action.id);
    default:
      return state.map(s=>TimerReducer(s,action));
  }
};

const updateTimer = (timer) => ({ type:'RENAME', id: timer.id, title: timer.title, project: timer.project });
const createTimer = (timer) => ({ type:'CREATE', id: helpers.uuid(), title: timer.title, project: timer.project });
const startTimer = (id) => ({ type: 'START', id: id });
const stopTimer = (id) => ({ type: 'STOP', id: id });
const deleteTimer = (id) => ({ type: 'DELETE', id: id });

/* section: Action to api requests */

const craeteApiPost = (endPoint, method, data, callBack) => {
  return fetch(endPoint, {
      method: method,
      body: data ? JSON.stringify(data) : undefined,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    }).then(callBack);
}

/* Section: Middleware */

const postToServer = store => next => action => {
  switch (action.type) {
    case 'START':
      craeteApiPost('api/timers/start', 'post' , {id : action.id} );
      break;
    case 'STOP':
      craeteApiPost('api/timers/stop', 'post', {id : action.id} );
      break;
    case 'RENAME':
      craeteApiPost('api/timers', 'put', {id : action.id, title: action.title, project: action.project} );
      break;
    case 'CREATE':
      craeteApiPost('api/timers', 'post', {id : action.id, title: action.title, project: action.project} );
      break;
    case 'DELETE' : 
      craeteApiPost('api/timers', 'delete', {id : action.id} );
      break;
    default: break;
  }
  return next(action);
}

/* Section: Sync with server */
const setToServerState = store => endPoint => () => {
  craeteApiPost(endPoint, 'get', undefined, d=> d.json().then(t=>store.dispatch({type: "SET_STATE", state: t})));
}

/* Section: React */

const TimerDashboard = () => (
      <div className='ui three column centered grid'>
        <div className='column'>
          <TimerListContainer />
          <TimerCreaterContainer />
        </div>
      </div>
      );

const TimerListContainer = connect(
  (state)=>({timers:state})
  )((props) => 
  props.timers.map(t=>
      <TimerContainer 
        key={t.id}
        timer={t}
      />
      ));

class TimerCreater extends Component {
  state = { isOpen: false };
  openForm = () => this.setState({isOpen: true});
  closeForm = () => this.setState({isOpen:false});
  onSubmit = (timer) => { this.props.onSubmit(timer); this.closeForm(); } 
  render() {
    if(this.state.isOpen)
      return <TimerEditor onCancel={this.closeForm} onSubmit={this.onSubmit}/>;
    else
      return (
        <div className='ui basic content center aligned segment'>
          <button className='ui basic button icon' onClick={this.openForm}>
            <i className='plus icon' />
          </button>
        </div>
        );
  }
}

const TimerCreaterContainer = connect(
  (state)=>({}),
  (dispatch) => ({
    onSubmit: (timer)=>dispatch(createTimer(timer))
  }))(TimerCreater);

class Timer extends Component {
  state = { isEditing: false };
  editTimer = () => this.setState({isEditing: true});
  displayTimer = () => this.setState({isEditing:false});
  onSubmit = (timer) => { this.props.onSubmit(timer); this.displayTimer(); }
  render() {
    if(this.state.isEditing)
      return <TimerEditor 
        id={this.props.timer.id}
        title={this.props.timer.title}
        project={this.props.timer.project}
        onCancel={this.displayTimer}
        onSubmit={this.onSubmit}
      />
    else
      return <TimerDisplay
        timer={this.props.timer}
        onEditClick={this.editTimer}
        onDeleteClick={this.props.onDeleteClick}
        onStartClick={this.props.onStartClick}
        onStopClick={this.props.onStopClick}
      />;
  }
}

const TimerContainer = connect( 
    (state) => ({}), 
    (dispatch, props) => 
    ({
      onSubmit: (timer) => dispatch(updateTimer(timer)),
      onDeleteClick: () => dispatch(deleteTimer(props.timer.id)),
      onStartClick: () => dispatch(startTimer(props.timer.id)),
      onStopClick: () => dispatch(stopTimer(props.timer.id))
    })
  )(Timer);

class TimerEditor extends Component {

  onSubmit = () => {
    this.props.onSubmit({
      id: this.props.id,
      title: this.refs.title.value,
      project: this.refs.project.value,
    });
  };

  render() {
    const submitText = this.props.id ? 'Update' : 'Create';
    return (
      <div className='ui centered card'>
        <div className='content'>
          <div className='ui form'>
            <div className='field'>
              <label>Title</label>
              <input type='text' defaultValue={this.props.title} ref='title' />
            </div>
            <div className='field'>
              <label>Project</label>
              <input type='text' defaultValue={this.props.project} ref='project' />
            </div>
            <div className='ui two bottom attached buttons'>
              <button className='ui basic blue button' onClick={this.onSubmit}>
                {submitText}
              </button>
              <button className='ui basic button red' onClick={this.props.onCancel}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
      );
  }
}

class TimerDisplay extends Component {
  componentDidMount() {
    this.forceUpdateInterval = setInterval(()=>this.forceUpdate(), 50);
  }

  componentWillUnmount() {
    clearInterval(this.forceUpdateInterval);
  }

  render() {
    const timer = this.props.timer;
    let totalElapsed = timer.elapsed;
    if(timer.startTime != null)
    {
      const now = new Date();
      const currentElapsed = now - timer.startTime;
      totalElapsed += currentElapsed;
    }
    const elapsedString = helpers.renderTime(totalElapsed);
    return (
      <div className='ui centered card'>
        <div className='content'>
          <div className='header'>
            {this.props.timer.title}
          </div>
          <div className='meta'>
            {this.props.timer.project}
          </div>
          <div className='centered aligned description'>
            <h2>
              {elapsedString}
            </h2>
          </div>
          <div className='extra content'>
            <span className='right floated edit icon' onClick={this.props.onEditClick}>
              <i className='edit icon' />
            </span>
            <span className='right floated trash icon' onClick={this.props.onDeleteClick}>
              <i className='trash icon' />
            </span>
          </div>
        </div>
        <TimerStartStop
          isRunning={this.props.timer.startTime !== null}
          toggleFunc={this.props.toggleFunc}
          startFunc={this.props.onStartClick}
          stopFunc={this.props.onStopClick}
          />
      </div>
      );
  }
}

const TimerStartStop = (props) => {
    let color;
    let text;
    let func;
    if(props.isRunning) {
      color = 'red';
      text = 'Stop';
      func = props.stopFunc;
    }
    else {
      color = 'blue';
      text = 'Start';
      func = props.startFunc;
    }
    return (
        <div className={'ui bottom attached ' + color + ' basic button'} onClick={func} >
          {text}
        </div>
        );
  }

const helpers = {
  renderTime: (duration) => {
    let milliseconds = Math.floor((duration % 1000) / 100),
      seconds = Math.floor((duration / 1000) % 60),
      minutes = Math.floor((duration / (1000 * 60)) % 60),
      hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;

    return hours + ":" + minutes + ":" + seconds + "." + milliseconds;
  },
  uuid: () => {
    return window.uuid.v4();
  }
};

function Run() {
  const store = createStore(TimersReducer, applyMiddleware(postToServer));
  setInterval(setToServerState(store)('/api/timers'), 1000);
  ReactDOM.render(<Provider store={store}><TimerDashboard /></Provider>, document.getElementById('root'));
}

export default Run;