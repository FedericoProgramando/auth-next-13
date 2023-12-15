"use client";
import { Form } from "@/components/Form";

export default function LoginPage() {
  return (
    <>
      <Form
        title="Iniciar Sesion"
        onSubmit={() => {}}
        description="Formulario para iniciar sesion"
      >
        <div className="my-[10px] flex flex-col gap-4">
          <Form.Input
            label="Correo"
            name="email"
            placeholder="Ingresa tu correo..."
          ></Form.Input>
          <Form.Input
            placeholder="Ingresa tu contraseña..."
            label="Contraseña"
            name="password"
            type="password"
          ></Form.Input>
        </div>
        <Form.SubmitButton buttonText="Iniciar Sesion"></Form.SubmitButton>
        <Form.Footer
          description="Te olvidaste la contraseña"
          link="/forget-password"
          textLink="Recuperar contraseña"
        ></Form.Footer>
        <Form.Footer
          description="Aun no tienes cuenta?"
          link="/register"
          textLink="Registrate"
        ></Form.Footer>
      </Form>
    </>
  );
}
