export class CreateUserDto {
  email!: string;
  shortName!: string;
  firstName?: string;
  lastName?: string;
  passwordHash!: string;
}
