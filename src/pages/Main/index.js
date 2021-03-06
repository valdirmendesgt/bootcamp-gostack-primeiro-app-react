import React, { Component } from 'react';
import { FaGithubAlt, FaPlus, FaSpinner } from 'react-icons/fa';
import { Link } from 'react-router-dom';

import api from '../../services/api';

import { Form, SubmitButton, List, ErrorMessage } from './styles';
import Container from '../../components/Container';

export default class Main extends Component {
  state = {
    newRepo: '',
    repositories: [],
    isLoading: false,
    invalidInput: false
  };

  componentDidMount() {
    const repositories = localStorage.getItem('repositories');
    if (repositories) {
      this.setState({
        repositories: JSON.parse(repositories)
      });
    }
  }

  componentDidUpdate(_, prevState) {
    if (prevState.repositories !== this.state.repositories) {
      localStorage.setItem(
        'repositories',
        JSON.stringify(this.state.repositories)
      );
    }
  }

  handleInputChage = e => {
    const { invalidInput } = this.state;
    this.setState({
      newRepo: e.target.value,
      invalidInput: e.target.value === '' ? false : invalidInput
    });
  };

  handleSubmit = async e => {
    e.preventDefault();

    try {
      const { newRepo, repositories } = this.state;

      const repository = repositories.find(r => r.name === newRepo);

      if (repository) {
        throw new Error('Repositório duplicado');
      }

      this.setState({ isLoading: true });
      const response = await api.get(`/repos/${newRepo}`);
      const data = {
        name: response.data.full_name
      };

      this.setState({
        repositories: [...repositories, data],
        newRepo: '',
        isLoading: false,
        invalidInput: false
      });
    } catch (error) {
      this.setState({
        isLoading: false,
        invalidInput: true
      });
    }
  };

  render() {
    const { newRepo, isLoading, repositories, invalidInput } = this.state;

    return (
      <Container>
        <h1>
          <FaGithubAlt />
          Repositórios
        </h1>
        <Form onSubmit={this.handleSubmit} invalidInput={invalidInput}>
          <input
            type="text"
            placeholder="Adicionar repositório"
            value={newRepo}
            onChange={this.handleInputChage}
          />
          <SubmitButton isLoading={isLoading}>
            {isLoading ? (
              <FaSpinner color="#FFF" size={14} />
            ) : (
              <FaPlus color="#FFF" size={14} />
            )}
          </SubmitButton>
        </Form>
        <ErrorMessage display={invalidInput}>
          Repositório inválido ou duplicado
        </ErrorMessage>
        <List>
          {repositories.map(repository => (
            <li key={repository.name}>
              <span>{repository.name}</span>
              <Link to={`/repository/${encodeURIComponent(repository.name)}`}>
                Detalhes
              </Link>
            </li>
          ))}
        </List>
      </Container>
    );
  }
}
