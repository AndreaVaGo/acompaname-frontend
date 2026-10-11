import Repository, { API_URL } from "./Repository";

export default class RoleRepository extends Repository {
  constructor() {
    super(API_URL);
  }

  async getAll() {
    return this.get("/roles");
  }
}