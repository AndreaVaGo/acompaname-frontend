import Repository from "./Repository";

export default class RoleRepository extends Repository {
  constructor() {
    super("http://localhost:8080/api/v1");
  }

  async getAll() {
    return this.get("/roles");
  }
}
