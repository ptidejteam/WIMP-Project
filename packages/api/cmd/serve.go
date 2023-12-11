package cmd

import (
	"github.com/ptidejteam/WIMPv2/packages/api/interceptor"
	"github.com/ptidejteam/WIMPv2/packages/api/server"
	pb "github.com/ptidejteam/WIMPv2/packages/protos/api"
	"github.com/ptidejteam/WIMPv2/protos/user"
	grpc_middleware "github.com/grpc-ecosystem/go-grpc-middleware"

	"log"
	"net"
	"os"

	"github.com/joho/godotenv"
	"github.com/spf13/cobra"
	"google.golang.org/grpc"
)

// srvCmd is the serve sub command to start the api server
var srvCmd = &cobra.Command{
	Use:   "serve",
	Short: "serve serves the api server",
	RunE:  serve,
}

func init() {
	//
}

func serve(cmd *cobra.Command, args []string) error {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	port := ":" + os.Getenv("PORT")
	lis, err := net.Listen("tcp", port)
	if err != nil {
		log.Fatalf("failed to listen: %v", err)
	}

	userAddress := os.Getenv("USER_ADDRESS")
	log.Println("Connecting to user service on " + userAddress)
	userConn, err := grpc.Dial(userAddress, grpc.WithInsecure(), grpc.WithBlock())
	if err != nil {
		log.Fatalf("did not connect: %v", err)
	}
	defer userConn.Close()
	userSvcClient := user.NewUserSvcClient(userConn)

	// projectAddress := os.Getenv("PROJECT_ADDRESS")
	// log.Println("Connecting to project service on " + projectAddress)
	// projectConn, err := grpc.Dial(projectAddress, grpc.WithInsecure(), grpc.WithBlock())
	// if err != nil {
	// 	log.Fatalf("did not connect: %v", err)
	// }
	// defer projectConn.Close()
	// projectSvcClient := project.NewProjectSvcClient(projectConn)

	// taskAddress := os.Getenv("TASK_ADDRESS")
	// log.Println("Connecting to task service on " + taskAddress)
	// taskConn, err := grpc.Dial(taskAddress, grpc.WithInsecure(), grpc.WithBlock())
	// if err != nil {
	// 	log.Fatalf("did not connect: %v", err)
	// }
	// defer projectConn.Close()
	// taskSvcClient := task.NewTaskSvcClient(taskConn)

	unaryInterceptors := []grpc.UnaryServerInterceptor{
		interceptor.UnaryAuthenticate(userSvcClient),
	}
	s := grpc.NewServer(grpc.UnaryInterceptor(grpc_middleware.ChainUnaryServer(unaryInterceptors...)))
	pb.RegisterAPIServer(s, server.New(userSvcClient))

	log.Println("Starting GRPC server at: " + port)
	if err := s.Serve(lis); err != nil {
		log.Fatalf("failed to serve: %v", err)
	}
	return nil
}
