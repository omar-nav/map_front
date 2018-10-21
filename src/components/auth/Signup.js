import React, { Component } from 'react';
//import { Input, Button } from 'antd'
import toastr from 'toastr';
import axios from 'axios';

class Signup extends Component {

    state = {
        signup: { username: "ciudadano" },
        loading: false
    }

    onChange = (e) => {
        const field = e.target.name
        const value = e.target.value
        const { signup } = this.state
        signup[field] = value
        this.setState({ signup })
    }

    createUser = (e) => {
        e.preventDefault()
        const { signup } = this.state
        if (signup.password !== signup.password2) {
            return toastr.error('Esta clave no es igual')
        }
        axios.post('http://localhost:3000/signup', signup)
            .then(user => {
                console.log(user)
                toastr.success("vientos!")
            })
            .catch(e => toastr.error("clave equivocada"))
    }

    render() {
        const { signup, loading } = this.state
        return (
            <form onSubmit={this.createUser} style={{ width: 600, margin: "0 auto", padding: 20 }}>
                <h2>Date de alta</h2>
                <p>
                    <input
                        name="username"
                        type="text"
                        onChange={this.onChange}
                        value={signup.username}
                        placeholder="Tu nombre de usuario"
                    />

                </p>
                <p>
                    <input
                        name="email"
                        type="email"
                        onChange={this.onChange}
                        value={signup.email}
                        placeholder="Tu correo"
                    />
                </p>
                <p>
                    <input
                        name="password"
                        type="password"
                        onChange={this.onChange}
                        value={signup.password}
                        placeholder="Tu Password"
                    />
                </p>
                <p>
                    <input
                        name="password2"
                        type="password"
                        onChange={this.onChange}
                        value={signup.password2}
                        placeholder="Repite tu Password"
                    />
                </p>
                <button loading={loading} type="primary" htmlType="submit" >Registrarme</button>
            </form>
        );
    }
}

export default Signup;