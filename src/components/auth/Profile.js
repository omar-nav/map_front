import React, { Component } from 'react'
import logo from '../../logo.svg'
import axios from 'axios'
import toastr from 'toastr'

class Profile extends Component {

    state = {
        user: {}
    }

    componentWillMount() {
        const user = JSON.parse(localStorage.getItem('user'))
        if (!user) return this.props.history.push('/login')
        this.setState({ user })
    }

    getPrivateInfo = () => {
        axios.get('http://localhost:3000/private', {
            headers: {
                "Authorization": localStorage.getItem('token')
            }
        })
            .then(res => {
                console.log(res)
            })
            .catch(e => toastr.error("algo fallo", e.message))
    }

    render() {
        const { user } = this.state
        return (
            <div>
                <img style={{ borderRadius: '50%' }} src={user.photoURL || logo} width="200" alt="user" />
                <h1>{user.username}</h1>
                <p>{user.email}</p>
                <button onClick={this.getPrivateInfo}> bajate mi pack privado ;)</button>
            </div>
        )
    }
}

export default Profile