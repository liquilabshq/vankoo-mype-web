import type {AxiosResponse} from 'axios';
import {BaseApi, type BaseApiOptions} from '../../shared/infrastructure/base-api';
import {BaseEndpoint} from '../../shared/infrastructure/base-endpoint';
import {SignInAssembler} from './sign-in.assembler';
import {SignUpAssembler} from './sign-up.assembler';
import type {SignInCommand} from '../domain/model/sign-in.command';
import type {SignUpCommand} from '../domain/model/sign-up.command';
import type {AuthenticatedUserResource} from './authenticated-user.resource';
import type {UserResource} from './user.resource';

const signUpEndpointPath = import.meta.env.VITE_SIGN_UP_ENDPOINT_PATH;
const signInEndpointPath = import.meta.env.VITE_SIGN_IN_ENDPOINT_PATH;
const usersEndpointPath = import.meta.env.VITE_USERS_ENDPOINT_PATH;

/**
 * The API of the IAM bounded context.
 *
 * Sign-in and sign-up reach for `this.http` directly rather than composing a
 * `BaseEndpoint`: they are commands, not CRUD over a collection, and an endpoint
 * object that only ever POSTs to one fixed path would earn nothing.
 *
 * It does not import its own interceptor. Doing so would make this module depend on
 * the store that depends on it; instead the store passes it in, which is the same
 * rule that keeps the shared kernel free of any bounded context.
 */
export class IamApi extends BaseApi {
    readonly #users: BaseEndpoint<UserResource>;

    constructor(options: BaseApiOptions = {}) {
        super(options);
        this.#users = new BaseEndpoint<UserResource>(this.http, usersEndpointPath);
    }

    signIn(command: SignInCommand): Promise<AxiosResponse<AuthenticatedUserResource>> {
        return this.http.post(signInEndpointPath, SignInAssembler.toRequestFromCommand(command));
    }

    signUp(command: SignUpCommand): Promise<AxiosResponse<UserResource>> {
        return this.http.post(signUpEndpointPath, SignUpAssembler.toRequestFromCommand(command));
    }

    /**
     * Reads an account by its email, which is how this API addresses users.
     *
     * The route is `/users/{email}`, so the identity in the URL is the email and not
     * the UUID — hence `getById` with a string. It is the one call in this context
     * that needs the bearer token.
     */
    getUserByEmail(email: string): Promise<AxiosResponse<UserResource>> {
        return this.#users.getById(email);
    }
}
