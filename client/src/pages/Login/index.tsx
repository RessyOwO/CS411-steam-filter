import { BaseSyntheticEvent, useState } from "react";
import {
  InputGroup,
  Input,
  InputRightElement,
  Button,
  VStack,
  Text,
  Heading,
  Flex,
  useToast,
  Link,
  FormControl,
  FormErrorMessage,
  FormLabel,
} from "@chakra-ui/react";
import { Link as RouterLink, useNavigate } from "react-router-dom";

const Login = (): React.ReactElement => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [usernameError, setUsernameError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);

  const navigate = useNavigate();
  const toast = useToast();

  const handleUsernameChange = (event: BaseSyntheticEvent) => {
    if (event.target.value === "") {
      setUsernameError(true);
    } else {
      setUsername(event.target.value);
      setUsernameError(false);
    }
  };

  const handlePasswordChange = (event: BaseSyntheticEvent) => {
    if (event.target.value === "") {
      setPasswordError(true);
    } else {
      setPassword(event.target.value);
      setPasswordError(false);
    }
  };

  const handlePasswordClick = () => setShowPassword(!showPassword);

  const handleSubmit = (): void => {
    if (!usernameError && !passwordError) {
      fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: username, password: password }),
      })
        .then((response) => {
          if (response.status === 200) {
            toast({
              title: "Login successful",
              status: "success",
              position: "top",
              duration: 5000,
            });

            return response.json();
          } else {
            toast({
              title: "Login failed",
              status: "error",
              position: "top",
              duration: 5000,
            });
          }
        })
        .then((json) => {
          localStorage.token = json.access_token;
          navigate("/profile");
        });
    }
  };

  return (
    <Flex minH={"100vh"} align={"center"} justify={"center"}>
      <VStack
        align="unset"
        spacing="5"
        p="5"
        border="1px"
        borderColor="gray.100"
        minWidth={"50vw"}
      >
        <Heading size="lg">Login</Heading>

        <FormControl isRequired isInvalid={usernameError}>
          <FormLabel>Username</FormLabel>
          <Input onChange={handleUsernameChange} placeholder="Username" />
          <FormErrorMessage>Username is required.</FormErrorMessage>
        </FormControl>

        <FormControl isRequired isInvalid={passwordError}>
          <FormLabel>Password</FormLabel>
          <InputGroup size="md">
            <Input
              pr="4.5rem"
              type={showPassword ? "text" : "password"}
              onChange={handlePasswordChange}
              placeholder="Password"
            />
            <InputRightElement width="4.5rem">
              <Button h="1.75rem" size="sm" onClick={handlePasswordClick}>
                {showPassword ? "Hide" : "Show"}
              </Button>
            </InputRightElement>
          </InputGroup>
          <FormErrorMessage>Password is required.</FormErrorMessage>
        </FormControl>

        <Button onClick={handleSubmit}>Login</Button>

        <Text>
          Don't have an account?{" "}
          <Link as={RouterLink} to="/register" color={"blue.400"}>
            Register here
          </Link>
          .
        </Text>
      </VStack>
    </Flex>
  );
};

export default Login;
